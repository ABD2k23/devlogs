import Link from "next/link";

const Footer = () => {
  return (
    <div className="border-t border-white/10 px-6 py-4 flex items-center justify-between">
      <h1 className="text-sm text-white/60">DevLogs</h1>
      <h1 className="text-sm text-white/60">
        Website by{" "}
        <Link
          className="text-white"
          href={"https://www.instagram.com/abd.dev.web/"}
          target="_blank"
        >
          Muhammad Abdullah
        </Link>
      </h1>
    </div>
  );
};

export default Footer;
