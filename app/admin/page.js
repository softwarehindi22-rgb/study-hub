"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  const [courseForm, setCourseForm] = useState({ title: "", slug: "", description: "" });
  const [chapterForm, setChapterForm] = useState({ title: "", position: 1 });
  const [resourceForm, setResourceForm] = useState({ title: "", type: "video", url: "", position: 1 });
  const [message, setMessage] = useState("");

  async function loadCourses() {
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    setCourses(data || []);
  }

  async function loadChapters(courseId) {
    const { data } = await supabase
      .from("chapters")
      .select("*")
      .eq("course_id", courseId)
      .order("position", { ascending: true });
    setChapters(data || []);
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profileData?.role !== "admin") {
        router.push("/");
        return;
      }
      setProfile(profileData);
      await loadCourses();
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleCreateCourse(e) {
    e.preventDefault();
    setMessage("");
    const { error } = await supabase.from("courses").insert({
      title: courseForm.title,
      slug: courseForm.slug,
      description: courseForm.description,
      status: "published"
    });
    if (error) setMessage(error.message);
    else {
      setMessage("Course created.");
      setCourseForm({ title: "", slug: "", description: "" });
      loadCourses();
    }
  }

  async function handleCreateChapter(e) {
    e.preventDefault();
    setMessage("");
    if (!selectedCourse) return setMessage("Select a course first.");
    const { error } = await supabase.from("chapters").insert({
      course_id: selectedCourse,
      title: chapterForm.title,
      position: Number(chapterForm.position),
      status: "published"
    });
    if (error) setMessage(error.message);
    else {
      setMessage("Chapter created.");
      setChapterForm({ title: "", position: 1 });
      loadChapters(selectedCourse);
    }
  }

  async function handleCreateResource(e) {
    e.preventDefault();
    setMessage("");
    if (!selectedChapter) return setMessage("Select a chapter first.");
    const { error } = await supabase.from("resources").insert({
      chapter_id: selectedChapter,
      title: resourceForm.title,
      type: resourceForm.type,
      url: resourceForm.url,
      position: Number(resourceForm.position),
      status: "published"
    });
    if (error) setMessage(error.message);
    else {
      setMessage("Resource added.");
      setResourceForm({ title: "", type: "video", url: "", position: 1 });
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-sm text-accent">
          ← Back
        </Link>
        <h1 className="text-lg font-bold text-ink">Admin</h1>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {message && <p className="text-sm text-accent bg-white p-3 rounded-lg shadow-sm">{message}</p>}

        <section className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-ink mb-3">New Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-3">
            <input
              placeholder="Title"
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
            <input
              placeholder="Slug (e.g. calculus-101)"
              value={courseForm.slug}
              onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
            <textarea
              placeholder="Description"
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <button className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium">
              Create Course
            </button>
          </form>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-ink mb-3">New Chapter</h2>
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              loadChapters(e.target.value);
            }}
            className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
          >
            <option value="">Select course...</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <form onSubmit={handleCreateChapter} className="space-y-3">
            <input
              placeholder="Chapter title"
              value={chapterForm.title}
              onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
            <input
              type="number"
              placeholder="Position"
              value={chapterForm.position}
              onChange={(e) => setChapterForm({ ...chapterForm, position: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <button className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium">
              Create Chapter
            </button>
          </form>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-ink mb-3">New Resource (video / notes link)</h2>
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
          >
            <option value="">Select chapter...</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <form onSubmit={handleCreateResource} className="space-y-3">
            <input
              placeholder="Resource title"
              value={resourceForm.title}
              onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
            <select
              value={resourceForm.type}
              onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="video">Video</option>
              <option value="notes">Notes</option>
              <option value="link">Link</option>
              <option value="book">Book</option>
              <option value="quiz">Quiz</option>
            </select>
            <input
              placeholder="URL (YouTube/Vimeo/Drive/PDF link)"
              value={resourceForm.url}
              onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            />
            <input
              type="number"
              placeholder="Position"
              value={resourceForm.position}
              onChange={(e) => setResourceForm({ ...resourceForm, position: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <button className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-medium">
              Add Resource
            </button>
          </form>
        </section>
      </main>
    </div>
  );
      }
