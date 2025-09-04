'use client';
type ErrorProps = {
  error: { message?: string };
  reset: () => void;
};
export default function Error({ error, reset }: ErrorProps) {
  console.log(error?.message);
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button className="bg-primary cursor-pointer text-white px-4 py-2 rounded" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
} 