import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { SiteNavbar } from "@/components/site/site-navbar";
import { SiteFooter } from "@/components/site/site-footer";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata = {
  title: "Insights — DeepTalent",
  description:
    "Strategic intelligence on global hiring, AI vetting, and remote team scaling from the DeepTalent team.",
};

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  read_time_minutes: number | null;
};

async function fetchPosts(): Promise<Post[]> {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data } = await sb
    .from("blog_posts")
    .select(
      "id,slug,title,excerpt,category,cover_image_url,published_at,read_time_minutes"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(60);
  return (data as Post[]) ?? [];
}

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

export default async function InsightsIndex() {
  const posts = await fetchPosts();
  const [hero, ...rest] = posts;

  return (
    <main className="min-h-screen bg-white">
      <SiteNavbar />

      <section className="px-4 md:px-8 lg:px-12 pt-24 md:pt-28 pb-12 max-w-7xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B5BDB] mb-3">
          DeepTalent Insights
        </p>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.05] max-w-4xl text-balance">
          Strategic intelligence on global hiring, AI vetting, and remote team scaling.
        </h1>
        <p className="text-lg text-gray-500 mt-5 max-w-2xl text-pretty">
          Deep dives, field notes, and frameworks from the team building Africa&apos;s workforce
          infrastructure for global financial services.
        </p>
      </section>

      {posts.length === 0 ? (
        <section className="px-4 md:px-8 lg:px-12 pb-24 max-w-7xl mx-auto">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center">
            <h2 className="text-lg font-semibold text-gray-900">No published articles yet</h2>
            <p className="text-gray-600 mt-1">Check back soon — new pieces are on the way.</p>
          </div>
        </section>
      ) : (
        <>
          {/* Featured */}
          <section className="px-4 md:px-8 lg:px-12 pb-12 max-w-7xl mx-auto">
            <Link
              href={`/insights/${hero.slug}`}
              className="group grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            >
              <div className="lg:col-span-7 relative h-72 md:h-[420px] rounded-2xl overflow-hidden bg-[#3B5BDB]">
                <Image
                  src={
                    hero.cover_image_url ||
                    `https://placehold.co/1600x1000/3B5BDB/ffffff?text=${encodeURIComponent(
                      hero.category || "Insights"
                    )}`
                  }
                  alt={hero.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              <div className="lg:col-span-5">
                {hero.category && (
                  <span className="inline-block px-3 py-1 rounded-full bg-[#3B5BDB]/10 text-[#3B5BDB] text-xs font-semibold uppercase tracking-wider mb-4">
                    {hero.category}
                  </span>
                )}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight tracking-tight group-hover:text-[#3B5BDB] transition-colors text-balance">
                  {hero.title}
                </h2>
                {hero.excerpt && (
                  <p className="text-gray-600 mt-4 text-pretty">{hero.excerpt}</p>
                )}
                <p className="text-sm text-gray-500 mt-5">
                  {fmtDate(hero.published_at)}
                  {hero.read_time_minutes ? ` · ${hero.read_time_minutes} min read` : ""}
                </p>
                <span className="inline-flex items-center gap-2 mt-6 text-[#3B5BDB] font-semibold">
                  Read article <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          </section>

          {/* Grid */}
          {rest.length > 0 && (
            <section className="px-4 md:px-8 lg:px-12 pb-24 max-w-7xl mx-auto">
              <div className="border-t border-gray-200 pt-10 mb-8 flex items-center gap-3">
                <div className="size-2 bg-[#3B5BDB] rounded-full" />
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">
                  More articles
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {rest.map((post) => (
                  <Link
                    key={post.id}
                    href={`/insights/${post.slug}`}
                    className="group flex flex-col rounded-2xl bg-white border border-gray-200 hover:border-[#3B5BDB]/40 hover:shadow-lg transition-all overflow-hidden"
                  >
                    <div className="relative h-44 bg-gradient-to-br from-[#3B5BDB] to-[#2d42a6]">
                      {post.cover_image_url && (
                        <Image
                          src={post.cover_image_url}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      {post.category && (
                        <span className="inline-block self-start px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600 mb-3">
                          {post.category}
                        </span>
                      )}
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[#3B5BDB] transition-colors text-pretty">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-4">
                        {fmtDate(post.published_at)}
                        {post.read_time_minutes ? ` · ${post.read_time_minutes} min read` : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <SiteFooter />
    </main>
  );
}
