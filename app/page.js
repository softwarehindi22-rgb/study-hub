"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function HomePage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (profileError) {
        console.error("Profile fetch error:", profileError);
      }
      setProfile(profileData);
      setDebugInfo({ userId: user.id, profileData, profileError });

      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      setCourses(courseData || []);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-ink">Study Hub</h1>
        <div className="flex items-center gap-4">
          {profile?.role === "admin" && (
            <Link href="/admin" className="text-sm text-accent font-medium">
              Admin
            </Link>
          )}
          <button onClick={handleSignOut} className="text-sm text-gray-500">
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {debugInfo && (
          <pre className="text-xs bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-4 overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        )}
        <h2 className="text-lg font-semibold text-ink mb-4">Your Courses</h2>
        {courses.length === 0 ? (
          <p className="text-gray-400 text-sm">No courses published yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="block bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-ink">{course.title}</h3>
                {course.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}