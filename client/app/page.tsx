"use client";
import React, { useCallback, useState } from "react";
import { BsTwitter } from "react-icons/bs";
import { IoHomeOutline } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";
import { IoMdNotificationsOutline } from "react-icons/io";
import { MdOutlineLocalPostOffice } from "react-icons/md";
import { PiBookmarkSimple } from "react-icons/pi";
import { FaRegUser } from "react-icons/fa";
import { CiCircleMore } from "react-icons/ci";
import { BsPeople } from "react-icons/bs";
import FeedCard from "@/components/FeedCard";
import { Inter, Quicksand } from "next/font/google";
import { FaXTwitter } from "react-icons/fa6";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import toast, { Toaster } from "react-hot-toast";
import { graphQLClient } from "@/clients/api";
import { verifyUserGoogleTokenQuery } from "@/graphql/query/user";
import { useCurrentUser } from "@/hooks/user";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { CiImageOn } from "react-icons/ci";
import { MdOutlineGifBox } from "react-icons/md";
import { BiPoll } from "react-icons/bi";
import { PiSmileyBold } from "react-icons/pi";
import { AiOutlineSchedule } from "react-icons/ai";
import { GrLocation } from "react-icons/gr";
import { useCreateTweet, useGetAllTweets } from "@/hooks/tweet";
import { Tweet } from "@/gql/graphql";

interface TwitterSidebarButton {
  title: string;
  icon: React.ReactNode;
}

const inter = Inter({ subsets: ["latin"] });
const quickSand = Quicksand({ subsets: ["latin"] });

const SidebarMenuIcons: TwitterSidebarButton[] = [
  {
    title: "Home",
    icon: <IoHomeOutline />,
  },
  {
    title: "Search",
    icon: <IoSearchOutline />,
  },
  {
    title: "Notifications",
    icon: <IoMdNotificationsOutline />,
  },
  {
    title: "Messages",
    icon: <MdOutlineLocalPostOffice />,
  },
  {
    title: "Bookmarks",
    icon: <PiBookmarkSimple />,
  },
  {
    title: "Communities",
    icon: <BsPeople />,
  },
  {
    title: "Premium",
    icon: <FaXTwitter />,
  },
  {
    title: "Profile",
    icon: <FaRegUser />,
  },
  {
    title: "More",
    icon: <CiCircleMore />,
  },
];

export default function Home() {
  const { user } = useCurrentUser();
  const { tweets = [] } = useGetAllTweets();
  console.log(tweets)
  const { mutate } = useCreateTweet();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const handleSelectImage = useCallback(
    () => {
      const input = document.createElement('input')
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();
    }, []
  )

  const hangleCreateTweet = useCallback(()=>{
    mutate({
      content: content,
      imageURL: user?.profileImageURL || null,
    })
  }, [content, mutate])

  const handleLoginWithGoogle = useCallback(
    async (cred: CredentialResponse) => {
      const googleToken = cred.credential;
      if (!googleToken) {
        return toast.error("user not found");
      }
      const { verifyGoogleToken } = await graphQLClient.request(
        verifyUserGoogleTokenQuery,
        { token: googleToken }
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
    [queryClient]
  );

  return (
    <div className={inter.className}>
      <div className="grid grid-cols-12 h-screen w-screen px-48">
        <div className="col-span-3 pt-10 px-2 ">
          <div className="text-4xl ml-6 h-fit hover:bg-gray-800 rounded-full p-2 cursor-pointer transition-all w-fit">
            <BsTwitter />
          </div>
          <div className="m-3 ml-2 mt-5 text-2xl pr-4">
            <ul>
              {SidebarMenuIcons.map((items) => {
                return (
                  <li
                    className="flex justify-start items-center gap-2  hover:bg-gray-800 rounded-2xl px-3 py-2 w-fit cursor-pointer mt-2"
                    key={items.title}
                  >
                    <span className="text-3xl">{items.icon}</span>
                    <span>{items.title}</span>
                  </li>
                );
              })}
            </ul>
            <button className="bg-[#1d9bf0] p-4 py-3 rounded-full w-full mt-5 mx-2">
              Tweet
            </button>
          </div>
          <div className="absolute bottom-5 flex gap-2 ml-3 items-center px-3 py-2 rounded-full">
            {user && user.profileImageURL && (
              <Image
                className="rounded-full"
                src={user?.profileImageURL}
                alt=""
                width={50}
                height={50}
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
          <div>
            <div className="border border-l-0 border-r-0 border-b-0 border-gray-600 p-3 hover:bg-slate-900 transition-all cursor-pointer">
              <div className="grid grid-cols-12">
                <div className="col-span-1">
                  {user?.profileImageURL && (
                    <Image
                      src={user?.profileImageURL}
                      alt="image"
                      height={50}
                      width={50}
                      className="rounded-full pt-1.5"
                    />
                  )}
                </div>
                <div className="col-span-11">
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 400,
                      lineHeight: 1.5,
                      color: "#fff",
                      backgroundColor: "transparent",
                      border: "none",
                      borderBottom: "1px solid #38444d",
                      padding: "1rem 1.5rem",
                      width: "100%",
                      resize: "none",
                      outline: "none",
                    }}
                    placeholder="What is happening?!"
                    rows={3}
                  ></textarea>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="flex mx-5 gap-3">
                      <CiImageOn className="text-xl" color="#1DA1F2" onClick={handleSelectImage}/>
                      <MdOutlineGifBox className="text-xl" color="#1DA1F2" />
                      <BiPoll className="text-xl" color="#1DA1F2" />
                      <PiSmileyBold className="text-xl" color="#1DA1F2" />
                      <AiOutlineSchedule className="text-xl" color="#1DA1F2" />
                      <GrLocation className="text-xl" color="#1DA1F2"/>
                    </div>
                    <button 
                    onClick={()=>{hangleCreateTweet(), setContent("")}} 
                    className="bg-[#1DA1F2] px-3 py-2 rounded-full text-sm">
                      Tweet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {
            tweets?.map(tweet => tweet? <FeedCard key={tweet?.id} data ={tweet as Tweet} /> : null)
          }
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
    </div>
  );
}
