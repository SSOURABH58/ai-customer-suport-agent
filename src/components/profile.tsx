import { LogOut } from "lucide-react";

function Profile({ username }: { username: string }) {
  const handleLogOut = () => {
    localStorage.clear();
    window.location.href = "/auth";
  };
  return (
    <div className=" absolute z-10 md:top-10 md:left-10 top-1 left-2 md:w-4 w-full md:-rotate-90 ">
      <div className="absolute md:right-0 md:bottom-0  flex flex-row items-center justify-center space-y-2  transform-origen-1 ">
        <button
          onClick={handleLogOut}
          className="flex flex-row active:text-white items-center justify-center text-gray-500 hover:text-red-500 transition-colors duration-200 opacity-50 hover:opacity-100 m-0 mr-1 cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
        </button>
        <p className=" text-lg  opacity-70 font-black uppercase text-gray-800 dark:text-gray-200 top-0 left-0">
          {username ?? "Loading..."}
        </p>
      </div>
    </div>
  );
}

export default Profile;
