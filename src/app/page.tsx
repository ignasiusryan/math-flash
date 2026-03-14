import Link from "next/link";

const hasClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_placeholder";

export default async function Home() {
  let isSignedIn = false;

  if (hasClerk) {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    isSignedIn = !!userId;
  } else {
    // Dev mode: always "signed in"
    isSignedIn = true;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="text-center max-w-lg">
        <div className="text-8xl mb-6 animate-float">✖️</div>
        <h1 className="text-5xl font-bold text-primary mb-4">Math Flash</h1>
        <p className="text-xl text-gray-600 mb-2">
          Master your multiplication tables!
        </p>
        <p className="text-lg text-gray-500 mb-8">
          Practice with fun flash cards and become a math star
        </p>

        <div className="flex flex-col gap-4 items-center">
          {isSignedIn ? (
            <Link
              href="/play"
              className="bg-primary text-white text-2xl font-bold py-4 px-12 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Start Playing!
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="bg-primary text-white text-2xl font-bold py-4 px-12 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Get Started!
              </Link>
              <Link
                href="/sign-in"
                className="text-primary text-lg font-medium hover:underline"
              >
                Already have an account? Sign in
              </Link>
            </>
          )}
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="text-3xl mb-1">🧠</div>
            <p className="text-sm font-medium text-gray-600">Smart Practice</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="text-3xl mb-1">⭐</div>
            <p className="text-sm font-medium text-gray-600">Earn Stars</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <div className="text-3xl mb-1">📊</div>
            <p className="text-sm font-medium text-gray-600">Track Progress</p>
          </div>
        </div>
      </div>
    </div>
  );
}
