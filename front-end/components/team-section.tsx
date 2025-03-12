import { Card, CardContent } from "@/components/ui/card";
import { Github } from "lucide-react";
import Link from "next/link";

interface TeamMember {
  name: string;
  role: string;
  github: string;
  avatar: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Rishabh K. Patel",
    role: "Lead Developer",
    github: "https://github.com/Rishabh050803",
    avatar: "/rkp.png?height=100&width=100",
  },
  {
    name: "Divyansh Pokharna",
    role: "ML Engineer",
    github: "https://github.com/Divy190905",
    avatar: "/divyansh.png?height=100&width=100",
  },
  {
    name: "Dhruv Parashar",
    role: "UI/UX Designer",
    github: "https://github.com/DhruvParashar673",
    avatar: "/dhruv.jpg?height=60&width=60",
  },
];

export default function TeamSection() {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">
        Our Team
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {teamMembers.map((member) => (
          <Card
            key={member.name}
            className="dark:bg-black dark:border-gray-800"
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src={member.avatar || "/placeholder.svg"}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mb-4"
                />
                <h3 className="text-xl font-semibold mb-1 dark:text-white">
                  {member.name}
                </h3>
                <p className="text-muted-foreground mb-4 dark:text-gray-400">
                  {member.role}
                </p>
                <Link
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub Profile</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
