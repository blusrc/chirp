import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { SignInButton, useUser, SignOutButton } from "@clerk/nextjs";

import { RouterOutputs, api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage } from "~/components/loading";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  if (!user) return null;

  console.log(user);

  return (
    <div className="flex grow gap-4">
      <Image
        src={user.profileImageUrl}
        alt="profile image"
        className="h-12 w-12 rounded-full border border-slate-600"
        width={56}
        height={56}
      />

      {/* <span>{user.externalId} <br/> {user.id}</span> */}

      <input
        type="text"
        placeholder="Type some emojis"
        className="grow bg-transparent px-2"
      />
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className="m-2 flex gap-3 rounded border-slate-100 bg-slate-800 py-4 px-3">
      <Image
        src={author.profilePicture}
        alt="profile pic"
        className="h-12 w-12 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <span className="text-slate-300">{`@${author.username}`}</span>
          <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
        </div>
        <div>{post.content}</div>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {[...data, ...data]?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
      {/* <div>Hello</div> */}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Chirp</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="w-full border-x border-slate-400 md:max-w-2xl">
          <div className="border-b border-slate-400 p-4">
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="rounded bg-purple-800 py-2 px-4 text-slate-100">
                  Sign in
                </button>
              </SignInButton>
            )}
            {!!isSignedIn && (
              <div className="flex justify-between gap-4">
                <CreatePostWizard />
                <SignOutButton>
                  <button className="rounded bg-purple-800 py-2 px-4 text-slate-100">
                    Sign out
                  </button>
                </SignOutButton>
              </div>
            )}
          </div>

          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
