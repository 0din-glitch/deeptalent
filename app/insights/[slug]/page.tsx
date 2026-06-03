import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteNavbar } from "@/components/site/site-navbar";
import { SiteFooter } from "@/components/site/site-footer";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 60;

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  read_time_minutes: number | null;
  author_name: string | null;
};

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function fetchPost(slug: string): Promise<Post | null> {
  const { data } = await sb()
    .from("blog_posts")
    .select(
      "id,slug,title,excerpt,content,category,cover_image_url,published_at,read_time_minutes,author_name"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return (data as Post) ?? null;
}

async function fetchRelated(slug: string, category: string | null) {
  const q = sb()
    .from("blog_posts")
    .select(
      "id,slug,title,excerpt,category,cover_image_url,published_at,read_time_minutes"
    )
    .eq("status", "published")
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(3);
  if (category) q.eq("category", category);
  const { data } = await q;
  return data ?? [];
}

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) return { title: "Article not found — DeepTalent" };
  return {
    title: `${post.title} — DeepTalent Insights`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function InsightArticle({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) notFound();
  const related = await fetchRelated(slug, post.category);

  return (
    <main className="min-h-screen bg-white">
      <SiteNavbar />

      <article className="pt-24 md:pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <Link
            href="/insights"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#3B5BDB] transition-colors mb-8"
          >
            <ArrowLeft className="size-3.5" /> All insights
          </Link>

          {post.category && (
            <span className="inline-block px-3 py-1 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB] text-xs font-semibold uppercase tracking-wider mb-5">
              {post.category}
            </span>
          )}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.1] text-balance">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-gray-600 mt-5 text-pretty">{post.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-7 text-sm text-gray-500 border-t border-b border-gray-100 py-4">
            {post.author_name && (
              <>
                <span className="font-medium text-gray-900">{post.author_name}</span>
                <span className="text-gray-300">·</span>
              </>
            )}
            <span>{fmtDate(post.published_at)}</span>
            {post.read_time_minutes ? (
              <>
                <span className="text-gray-300">·</span>
                <span>{post.read_time_minutes} min read</span>
              </>
            ) : null}
          </div>
        </div>

        {post.cover_image_url && (
          <div className="max-w-5xl mx-auto px-4 md:px-6 mt-10">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 md:px-6 mt-12">
          <div className="prose prose-slate prose-lg max-w-none prose-headings:tracking-tight prose-headings:text-gray-900 prose-a:text-[#3B5BDB] prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-img:rounded-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content || ""}
            </ReactMarkdown>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100 py-16 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="size-2 bg-[#3B5BDB] rounded-full" />
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">
                Related reading
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r: any) => (
                <Link
                  key={r.id}
                  href={`/insights/${r.slug}`}
                  className="group flex flex-col rounded-2xl bg-white border border-gray-200 hover:border-[#3B5BDB]/40 hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="relative h-40 bg-gradient-to-br from-[#3B5BDB] to-[#2d42a6]">
                    {r.cover_image_url && (
                      <Image
                        src={r.cover_image_url}
                        alt={r.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    {r.category && (
                      <span className="inline-block self-start px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600 mb-2">
                        {r.category}
                      </span>
                    )}
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#3B5BDB] transition-colors">
                      {r.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-3">
                      {fmtDate(r.published_at)}
                      {r.read_time_minutes ? ` · ${r.read_time_minutes} min read` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
