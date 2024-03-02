"use client";
import { useRouter } from "next/navigation";
import { graphQLClient } from "@/clients/api";
import { getUserById, verifyUserGoogleTokenQuery } from "@/graphql/query/user";
import { useGetAllTweets, useCreateTweet } from "@/hooks/tweet";
import { useCurrentUser } from "@/hooks/user";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useQueryClient } from "@tanstack/react-query";
import { GetServerSideProps, NextPage } from "next";
import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { BsPeople, BsTwitter } from "react-icons/bs";
import { CiCircleMore, CiImageOn } from "react-icons/ci";
import { GrLocation } from "react-icons/gr";
import { MdOutlineGifBox, MdOutlineLocalPostOffice } from "react-icons/md";
import { PiBookmarkSimple, PiSmileyBold } from "react-icons/pi";
import Image from "next/image";
import { Inter } from "next/font/google";
import { FaRegUser } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoIosArrowRoundBack, IoMdNotificationsOutline } from "react-icons/io";
import { IoHomeOutline, IoSearchOutline } from "react-icons/io5";
import FeedCard from "@/components/FeedCard";
import { Tweet, User } from "@/gql/graphql";
import Link from "next/link";

interface TwitterSidebarButton {
  title: string;
  icon: React.ReactNode;
  link: string;
}

interface ServerProps {
  user?: User;
}

const inter = Inter({ subsets: ["latin"] });

const UserPage: NextPage<ServerProps> = (props) => {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  const router = useRouter();

  const SidebarMenuIcons: TwitterSidebarButton[] = useMemo(
    () => [
      {
        title: "Home",
        icon: <IoHomeOutline />,
        link: "/",
      },
      {
        title: "Search",
        icon: <IoSearchOutline />,
        link: "/",
      },
      {
        title: "Notifications",
        icon: <IoMdNotificationsOutline />,
        link: "/",
      },
      {
        title: "Messages",
        icon: <MdOutlineLocalPostOffice />,
        link: "/",
      },
      {
        title: "Bookmarks",
        icon: <PiBookmarkSimple />,
        link: "/",
      },
      {
        title: "Communities",
        icon: <BsPeople />,
        link: "/",
      },
      {
        title: "Premium",
        icon: <FaXTwitter />,
        link: "/",
      },
      {
        title: "Profile",
        icon: <FaRegUser />,
        link: `/${user?.id}`,
      },
      {
        title: "More",
        icon: <CiCircleMore />,
        link: "/",
      },
    ],
    [user?.id],
  );

  const handleLoginWithGoogle = useCallback(
    async (cred: CredentialResponse) => {
      const googleToken = cred.credential;
      if (!googleToken) {
        return toast.error("user not found");
      }
      const { verifyGoogleToken } = await graphQLClient.request(
        verifyUserGoogleTokenQuery,
        { token: googleToken },
      );

      toast.success("Verification Successfull");
      console.log(verifyGoogleToken);

      if (verifyGoogleToken) {
        window.localStorage.setItem("__twitter_token", verifyGoogleToken);
      }

      await queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });
    },
    [queryClient],
  );

  const handleLogout = useCallback(() => {
    window.localStorage.removeItem("__twitter_token");
    window.location.reload();
  }, []);

  return (
    <div className={inter.className}>
      {user && (
        <div className="grid grid-cols-12 h-screen w-screen px-48">
          <div className="col-span-3 pt-10 px-2 ">
            <div className="text-4xl ml-6 h-fit hover:bg-gray-800 rounded-full p-2 cursor-pointer transition-all w-fit">
              <BsTwitter />
            </div>
            <div className="m-3 ml-2 mt-5 text-2xl pr-4">
              <ul>
                {SidebarMenuIcons.map((items) => {
                  return (
                    <li key={items.title}>
                      <Link
                        href={items.link}
                        className="flex justify-start items-center gap-2  hover:bg-gray-800 rounded-2xl px-3 py-2 w-fit cursor-pointer mt-2"
                      >
                        <span className="text-3xl">{items.icon}</span>
                        <span>{items.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <button className="bg-[#1d9bf0] p-4 py-3 rounded-full w-full mt-5 mx-2">
                Tweet
              </button>
            </div>
            <div className=" bottom-5 mt-20 flex gap-2 ml-3 items-center px-3 py-2 rounded-full">
              {user && user.profileImageURL && (
                <Image
                  className="rounded-full"
                  src={user?.profileImageURL}
                  alt=""
                  width={50}
                  height={50}
                  onClick={handleLogout}
                />
              )}
              <div className="flex flex-row">
                <h3 className="text-xl">
                  {user?.firstName} {user?.lastName}
                </h3>
              </div>
            </div>
          </div>
          <div className="col-span-6 border-r-[0.2px] border-l-[0.2px] border-gray-600">
            <div className="mt-4 mx-3">
              <nav className=" flex items-center gap-3 ">
                <IoIosArrowRoundBack className="text-4xl" />
                <div>
                  <div className="text-2xl font-bold">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-sm text-slate-500">
                    {user?.tweets?.length} Tweets
                  </div>
                </div>
              </nav>
              <div className="p-4 border-b border-slate-600">
                {user?.profileImageURL && (
                  <Image
                    src={user?.profileImageURL}
                    alt="user-image"
                    width={100}
                    height={100}
                    className="rounded-full"
                  />
                )}
                <div className="text-xl font-bold mt-3">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-gray-300 text-xs mt-0.5">
                  @{user?.email.split("@")[0]}
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-sm mt-2 text-gray-400">
                    <span>{user?.followers?.length} Followers</span>
                    <span>{user?.following?.length} Following</span>
                  </div>
                  {user.id && (
                    <button className="bg-white text-black px-3 py-1 rounded-full text-sm">
                      Follow
                    </button>
                  )}
                </div>
              </div>
              <div>
                {user?.tweets?.map((tweet) => (
                  <FeedCard data={tweet as Tweet} key={tweet?.id} />
                ))}
              </div>
            </div>
          </div>
          <div className="col-span-3 p-5">
            {!user && (
              <div className="p-5 rounded-lg">
                <h1 className="my-2 text-2xl">New to Twitter?</h1>
                <GoogleLogin onSuccess={handleLoginWithGoogle} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
