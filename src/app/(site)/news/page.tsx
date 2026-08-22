"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Calendar, User, ArrowRight, Loader2, Newspaper, ImageIcon } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import PageHero from "@/components/ui/PageHero";
import Modal from "@/components/ui/Modal";
import { images, hasImage } from "@/lib/images";
import { getDb } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

interface NewsPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  imageUrl: string;
  category: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NewsPost | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const db = getDb();
        const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setNews(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as NewsPost[]);
      } catch (err) {
        console.error("Error fetching news:", err);
        setNews([]);
      }
      setLoading(false);
    }
    fetchNews();
  }, []);

  const getImageUrl = (post: NewsPost): string => post.imageUrl || images.fallback.news || "";

  return (
    <>
      <PageHero title="News & Blog" breadcrumb="Home" image={images.hero.news} />

      <section className="py-20 bg-slate-50 min-h-[50vh]">
        <div className="section-container">
          <AnimateOnScroll className="text-center mb-16">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Latest Updates</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mt-2">Corporate News & Announcements</h2>
          </AnimateOnScroll>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-accent" size={40} /></div>
          ) : news.length === 0 ? (
            <AnimateOnScroll>
              <div className="max-w-md mx-auto text-center py-16">
                <div className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Newspaper size={40} className="text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-3">No News Yet</h3>
                <p className="text-slate-500 leading-relaxed">We&apos;re preparing exciting news updates. Please check back soon.</p>
              </div>
            </AnimateOnScroll>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((post, i) => {
                const imgUrl = getImageUrl(post);
                const showImg = hasImage(imgUrl);
                return (
                  <AnimateOnScroll key={post.id} delay={i * 100}>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-400 hover:-translate-y-2 group h-full flex flex-col border border-slate-100">
                      <div className="relative h-52 overflow-hidden">
                        {showImg ? (
                          <Image src={imgUrl} alt={post.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized loading="lazy" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                            <Newspaper size={48} className="text-slate-400" />
                          </div>
                        )}
                        <span className="absolute top-4 left-4 glass-elevated text-white text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                          <span className="flex items-center gap-1"><Calendar size={12} />{post.date}</span>
                          <span className="flex items-center gap-1"><User size={12} />{post.author}</span>
                        </div>
                        <h3 className="font-bold text-primary text-lg mb-3 group-hover:text-accent transition-colors line-clamp-2">{post.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed flex-1 line-clamp-3">{post.excerpt}</p>
                        <button onClick={() => setSelected(post)} className="mt-4 text-accent font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                          Read More <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </AnimateOnScroll>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title}>
        {selected && (
          <div>
            <div className="relative h-56 sm:h-64">
              {hasImage(getImageUrl(selected)) ? (
                <Image src={getImageUrl(selected)} alt={selected.title} fill className="object-cover" unoptimized />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <ImageIcon size={60} className="text-slate-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/60 to-transparent" />
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                <span className="bg-accent/10 text-accent px-3 py-1 rounded-full font-medium">{selected.category}</span>
                <span className="flex items-center gap-1"><Calendar size={12} />{selected.date}</span>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-4">{selected.title}</h2>
              <p className="text-slate-600 leading-relaxed">{selected.content || selected.excerpt}</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}