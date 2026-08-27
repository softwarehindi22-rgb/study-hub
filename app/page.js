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

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      try {
        // Get currently logged-in user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("User error:", userError);
        }

        if (!user) {
          router.replace("/login");
          return;
        }

        // Load the user's profile and role
        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
        }

        // Load published courses
        const {
          data: courseData,
          error: courseError,
        } = await supabase
          .from("courses")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (courseError) {
          console.error("Courses fetch error:", courseError);
        }

        if (!mounted) return;

        setProfile(profileData || null);
        setCourses(courseData || []);
      } catch (error) {
        console.error("Homepage error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-ink"
          >
            Study Hub
          </Link>

          <div className="flex items-center gap-5">
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-semibold text-accent hover:underline"
              >
                Admin
              </Link>
            )}

            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-ink">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h2>

          <p className="text-gray-500 mt-1">
            Continue your learning.
          </p>
        </div>

        <h3 className="text-lg font-semibold text-ink mb-4">
          Your Courses
        </h3>

        {courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-400 text-sm">
              No courses published yet.
            </p>

            {isAdmin && (
              <Link
                href="/admin"
                className="inline-block mt-4 text-sm font-medium text-accent hover:underline"
              >
                Go to Admin and add a course
              </Link>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="block bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition"
              >
                <h4 className="font-semibold text-ink">
                  {course.title}
                </h4>

                {course.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                    {course.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}