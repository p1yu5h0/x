import React from "react";
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

interface TwitterSidebarButton {
  title: string;
  icon: React.ReactNode;
}

const inter = Inter({subsets: ["latin"]})
const quickSand = Quicksand({ subsets: ["latin"]})

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
    icon: <IoMdNotificationsOutline />
  },
  {
    title: "Messages",
    icon: <MdOutlineLocalPostOffice />
  },
  {
    title: "Bookmarks",
    icon: <PiBookmarkSimple />
  },
  {
    title: "Communities",
    icon: <BsPeople />
  },
  {
    title: "Premium",
    icon: <FaXTwitter />
  },
  {
    title: "Profile",
    icon: <FaRegUser />
  },
  {
    title: "More",
    icon: <CiCircleMore />
  }
];

export default function Home() {
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
                  <li className="flex justify-start items-center gap-2  hover:bg-gray-800 rounded-2xl px-3 py-2 w-fit cursor-pointer mt-2" key={items.title}>
                    <span className="text-3xl">{items.icon}</span>
                    <span>{items.title}</span>
                  </li>
                );
              })}
            </ul>
            <button className="bg-[#1d9bf0] p-4 py-3 rounded-full w-full mt-5 mx-2">Tweet</button>
          </div>
        </div>
        <div className="col-span-6 border-r-[0.2px] border-l-[0.2px] border-gray-600">
          <FeedCard />
          <FeedCard />
          <FeedCard />
          <FeedCard />
          <FeedCard />
          <FeedCard />
          <FeedCard />
          <FeedCard />
        </div>
        <div className="col-span-3"></div>
      </div>
    </div>
  );
}
