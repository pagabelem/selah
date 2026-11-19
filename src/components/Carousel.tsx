export default function Carousel({ children }: { children: React.ReactNode }) {
  return <div className="carousel -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4">{children}</div>;
}