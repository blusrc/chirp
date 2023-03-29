import Image from "next/image";
import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className="flex gap-3 border-b border-slate-100 p-4">
      <Image
        src={author.profilePicture}
        alt="profile pic"
        className="h-14 w-14 rounded-full"
        width={64}
        height={64}
      />
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Link href={`@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
        </div>

        <Link href={`/post/${post.id}`}>
          <div className="text-xl">{post.content}</div>
        </Link>
      </div>
    </div>
  );
};
