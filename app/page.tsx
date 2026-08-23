import Link from "next/link";
import { Images, Upload, Leaf, Palette, Fish } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent px-6 py-16 text-white sm:px-12 sm:py-20">
        <h1 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
          Bay Area Budding Artists 🎨🌱
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/90">
          A workshop where young artists learn about the native plants and
          animals of the Bay Area — their biology, and how they help our local
          ecosystems — then draw what they discover. This is where their
          artwork comes to life.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/gallery"
            className="flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-base font-bold text-dark transition hover:brightness-105"
          >
            <Images size={20} />
            See the gallery
          </Link>
          <Link
            href="/upload"
            className="flex items-center gap-2 rounded-full bg-white/15 px-6 py-3 text-base font-bold text-white transition hover:bg-white/25"
          >
            <Upload size={20} />
            Add your art
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <InfoCard
          icon={<Fish size={22} />}
          title="Learn the biology"
          body="Short lessons on native species — their bodies, habitats, and role in our ecosystems and communities."
        />
        <InfoCard
          icon={<Palette size={22} />}
          title="Draw what you learn"
          body="Guided drawing sessions turn each lesson into a piece of art that's all your own."
        />
        <InfoCard
          icon={<Leaf size={22} />}
          title="Share your work"
          body="Upload your artwork to the gallery and explore what other young artists have created."
        />
      </section>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-surface p-5 ring-1 ring-black/5">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <h3 className="text-lg font-extrabold text-dark">{title}</h3>
      <p className="text-sm text-muted">{body}</p>
    </div>
  );
}
