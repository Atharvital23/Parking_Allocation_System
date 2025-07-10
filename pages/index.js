import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/login");
  }, [router]);
  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h1>Welcome to Parking Allocation System</h1>
      <Link href="/login">
        <button>Go to Login</button>
      </Link>
    </div>
  );
}