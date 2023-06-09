import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { LoadingPage } from "~/components/loading";
import { PageLayout } from "~/components/pageLayout";
import Image from "next/image";
import { PostView } from "~/components/postView";
import Link from "next/link";

// type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username,
  });
  if (isLoading) return <LoadingPage />;
  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`Chirp | @${data.username ?? "username"}`}</title>
      </Head>
      <PageLayout>
        <div className="relative h-48 bg-slate-800">
          <div className="p-4">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded bg-slate-400"
            >
              🕊️
            </Link>
          </div>

          <Image
            src={data.profilePicture}
            width={128}
            height={128}
            alt={`${username ?? ""}'s profile picture'`}
            className="absolute bottom-0 left-0 -mb-16 ml-4 rounded-full border-2 border-slate-900"
          />
        </div>
        <div className="mt-16 border-b-2 border-slate-400 px-4 py-4">
          <div className="text-2xl font-bold">{`@${username}`}</div>
        </div>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = ctx.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug!");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username: slug });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
