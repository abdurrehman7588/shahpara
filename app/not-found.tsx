import { ButtonLink } from "@/components/ui/Button";
import { PostmarkLines } from "@/components/ui/Ornaments";

export default function NotFound() {
  return (
    <section className="container-site flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <PostmarkLines className="w-40 text-stamp/40" />
      <p className="label mt-8">404 · Return to sender</p>
      <h1 className="mt-4 text-display-lg">
        This letter <em className="italic text-stamp">went astray.</em>
      </h1>
      <p className="mt-5 max-w-md text-lg text-ink-soft">The page you’re looking for has moved or never existed. Let’s get you somewhere lovely.</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/shop">Browse the shop</ButtonLink>
        <ButtonLink href="/" variant="outline" arrow={false}>
          Back home
        </ButtonLink>
      </div>
    </section>
  );
}
