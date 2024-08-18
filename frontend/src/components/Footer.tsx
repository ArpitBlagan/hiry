import { GithubIcon, LinkedinIcon } from "lucide-react";
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <div
      className="flex flex-wrap gap-3 items-center text-white justify-start  mt-4 h-[200px] border rounded-t-xl px-6"
      style={{ backgroundColor: "#121212" }}
    >
      <div>
        <h1>Made with ❤️ By Arpit Blagan 🇮🇳</h1>
      </div>
      <div>
        <a
          href="https://github.com/ArpitBlagan"
          target="_blank"
          rel="noreferrer"
        >
          <GithubIcon width={50} height={30} />
        </a>
      </div>
      <div>
        <a
          href="https://www.linkedin.com/in/arpit-blagan-79081b193/"
          target="_blank"
          rel="noreferrer"
        >
          <LinkedinIcon width={50} height={30} />
        </a>
      </div>
      <div className="flex-1 flex justify-end items-center gap-4">
        <Link to="/" className="font-semibold text-xl">
          <h1 className="text-[30px] section-heading">Connect</h1>
        </Link>
      </div>
    </div>
  );
};

export default Footer;
