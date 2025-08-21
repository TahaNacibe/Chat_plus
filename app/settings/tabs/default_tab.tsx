import { Badge } from "@/components/ui/badge";
import Image from "next/image";

type WorkInProgressProps = {
  title: string;
};

export default function WorkInProgress({ title }: WorkInProgressProps) {
  return (
    <div className="w-full h-[65vh] flex flex-col justify-center items-center text-center px-4">
      <Image
        src="/work_in_progress.svg"
        alt="Work in progress"
        width={200}
        height={200}
        className="mb-4"
        priority
      />
      <p className="text-gray-500 max-w-md">
        This feature <Badge>
        {title}
        </Badge> is not implemented yet.
        <br />
        It is planned for future updates — stay tuned!
      </p>
    </div>
  );
}
