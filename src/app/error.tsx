"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] px-4">
      <div className="text-5xl mb-4">😵</div>
      <h2 className="text-lg font-semibold text-gray-700 mb-2">出了点问题</h2>
      <p className="text-sm text-gray-400 mb-6 text-center">
        {error.message || "页面加载失败，请重试"}
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        重试
      </button>
    </div>
  );
}
