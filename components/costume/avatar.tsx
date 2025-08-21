import { User } from "lucide-react";

const PfpWidget = ({ msg, isDark, profilePicture }: { msg: any, isDark: boolean, profilePicture: string | null }) => {
  

    const Avatar = () => {
    if (profilePicture) {
      return  <img
          src={profilePicture}
          alt=""
          className="rounded-full w-10 max-w-none"
        />
    } else {
      return <User size={14} />
    }
    }


    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        msg.role === 'user' 
          ? `${isDark? "bg-white text-black" :  "bg-black text-white"}` 
          : 'bg-gray-100 text-gray-600'
      }`}>
        {msg.role === 'user' ? (
            <Avatar />
        ) : (
          <div className="w-4 h-4 bg-gray-400 rounded-sm" />
        )}
      </div>
    );
  }



export default PfpWidget