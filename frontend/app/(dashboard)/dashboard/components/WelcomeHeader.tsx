interface WelcomeHeaderProps {
  userName: string;
}

export const WelcomeHeader = ({ userName }: WelcomeHeaderProps) => {
  return (
    <div className="sm:p-8 p-4">
      <h1 className="text-3xl font-semibold text-gray-900 mb-2 flex items-center">
        <span className="mr-2">👋</span>Welcome back,{" "}
        {userName || "Loading user…"}
      </h1>
      <p className="text-gray-600">
        Welcome back! Here&apos;s what&apos;s happening with your credit repair
        business.
      </p>
    </div>
  );
};
