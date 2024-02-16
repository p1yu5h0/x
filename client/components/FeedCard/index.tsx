import React from "react";
import Image from "next/image";
import { TbMessageCircle } from "react-icons/tb";
import { FaRetweet } from "react-icons/fa6";
import { IoMdHeartEmpty } from "react-icons/io";
import { CgLoadbarSound } from "react-icons/cg";
import { PiBookmarkSimple } from "react-icons/pi";
import { CgSoftwareUpload } from "react-icons/cg";

const FeedCard: React.FC = () => {
  return (
    <div className="border border-l-0 border-r-0 border-b-0 border-gray-600 p-5 hover:bg-slate-900 transition-all cursor-pointer">
      <div className="grid grid-cols-12">
        <div className="col-span-1">
          <Image
            src="https://avatars.githubusercontent.com/u/74711555?v=4"
            alt="image"
            height={50}
            width={50}
            className="rounded-full"
          />
        </div>
        <div className="col-span-11 pl-2">
          <h5 className="font-semibold">Piyush Agrawal</h5>
          <p>
            Is it just me or everyone else? Do you feel the code quality
            decrease as the project size increases?
          </p>
          <div className="flex justify-between pt-2.5 px-1.5 text-xl items-center w-[100%]">
            <div>
              <TbMessageCircle />
            </div>
            <div>
              <FaRetweet />
            </div>
            <div>
              <IoMdHeartEmpty />
            </div>
            <div>
              <CgLoadbarSound />
            </div>
            <div>
                <div className="flex justify-between">
                    <PiBookmarkSimple />
                    <CgSoftwareUpload />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
