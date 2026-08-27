"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

function toEmbedUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      let videoId = u.searchParams.get("v");
      if (u.hostname.includes("youtu.be")) videoId = u.pathname.slice(1);
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      return `https://player.vimeo.com/video/${id}`;
    }
    if (u.hostname.includes("drive.google.com")) {
      return url.replace("/view", "/preview");
    }
    return url;
  } catch {
    return url;
  }
}

export default function CoursePage() {
  const router = useRouter();
  const params = useParams();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [resourcesByChapter, setResourcesByChapter] = useState({});
  const [activeResource, setActiveResource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", params.slug)
        .eq("status", "published")
        .single();

      if (!courseData) {
        setLoading(false);
        return;
      }
      setCourse(courseData);

      const { data: chapterData } = await supabase
        .from("chapters")
        .select("*")
        .eq("course_id", courseData.id)
        .eq("status", "published")
        .order("position", { ascending: true });
      setChapters(chapterData || []);

      if (chapterData && chapterData.length > 0) {
        const chapterIds = chapterData.map((c) => c.id);
        const { data: resourceData } = await supabase
          .from("resources")
          .select("*")
          .in("chapter_id", chapterIds)
          .eq("status", "published")
          .order("position", { ascending: true });

        const grouped = {};
        (resourceData || []).forEach((r) => {
          if (!grouped[r.chapter_id]) grouped[r.chapter_id] = [];
          grouped[r.chapter_id].push(r);
        });
        setResourcesByChapter(grouped);
      }
      setLoading(false);
    }
    load();
  }, [params.slug, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Course not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-sm text-accent">
          ← Back
        </Link>
        <h1 className="text-lg font-bold text-ink">{course.title}</h1>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {chapters.length === 0 && (
          <p className="text-gray-400 text-sm">No chapters published yet.</p>
        )}
        {chapters.map((chapter) => (
          <div key={chapter.id} className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-ink mb-3">{chapter.title}</h2>
            <div className="space-y-2">
              {(resourcesByChapter[chapter.id] || []).map((res) => (
                <button
                  key={res.id}
                  onClick={() => setActiveResource(res)}
                  className="w-full text-left flex items-center gap-3 border rounded-lg px-3 py-2 hover:bg-gray-50 text-sm"
                >
                  <span className="text-xs uppercase tracking-wide text-accent font-medium w-14">
                    {res.type}
                  </span>
                  <span className="text-ink">{res.title}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </main>

      {activeResource && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setActiveResource(null)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <h3 className="font-medium text-ink">{activeResource.title}</h3>
              <button onClick={() => setActiveResource(null)} className="text-gray-400 text-sm">
                Close
              </button>
            </div>
            <div className="flex-1 bg-gray-100">
              <iframe
                src={toEmbedUrl(activeResource.url)}
                className="w-full h-[70vh]"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
