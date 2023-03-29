import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profilePicture: user.profileImageUrl,
    // externalUsername:
    //   user.externalAccounts.find(
    //     (externalAccount) => externalAccount.provider === "oauth_github"
    //   )?.username || null,
  };
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(filterUserForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Author for post not found. POST ID: ${post.id}, USER ID: ${post.authorId}`,
        });

      // if (!author.username) {
      //   // user the ExternalUsername
      //   if (!author.externalUsername) {
      //     throw new TRPCError({
      //       code: "INTERNAL_SERVER_ERROR",
      //       message: `Author has no GitHub Account: ${author.id}`,
      //     });
      //   }
      //   author.username = author.externalUsername;
      // }

      return { post, author };
    });
  }),
});