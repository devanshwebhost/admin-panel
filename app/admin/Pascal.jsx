'use client';

import { useEffect, useState } from "react";
import GroqChat from "@/components/GroqChat";
import MobileNavbar from "@/components/MobileNavbar";

export default function Pascel({user}) {
  const [contextData, setContextData] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchUserDataForAI = async () => {
      if (!user?._id) return;

      try {
        // 1. Fetch Global AI Settings (Role & Services)
        const adminRes = await fetch("/api/admin");
        const adminSettings = adminRes.ok ? await adminRes.json() : {};

        // 2. Fetch User Specific Todos
        const todoRes = await fetch(`/api/userTodos?userId=${user._id}`);
        const todoJson = await todoRes.json();
        const todos = todoJson.myTodos || [];

        // 3. Fetch User Specific Assigned Tasks
        const taskRes = await fetch(`/api/tasks?assignedTo=${user._id}`);
        const taskJson = await taskRes.json();
        const tasks = taskJson.tasks || [];

        // 4. Fetch Projects - Handled specifically so a failure here doesn't block the AI initialization
        let fetchedProjects = [];
        try {
          const projectRes = await fetch("/api/projects");
          if (projectRes.ok) {
            const projectJson = await projectRes.json();
            fetchedProjects = projectJson.projects || [];
          }
        } catch (err) {
          console.error("Project context fetch failed:", err);
        }
        setProjects(fetchedProjects);

        // 5. Prepare a Structured Context String for the LLM
        const formattedTodos = todos.length > 0 
          ? todos.map(t => `- ${t.text} (${t.completed ? 'Completed' : 'Pending'})`).join("\n")
          : "No personal todos.";

        const formattedTasks = tasks.length > 0
          ? tasks.map(t => `- Task: ${t.title} | Status: ${t.status} | Deadline: ${new Date(t.dueDate).toLocaleDateString()}`).join("\n")
          : "No professional tasks assigned.";

        const formattedProjects = fetchedProjects.length > 0
          ? fetchedProjects.map(p => `- Project: ${p.name || p.title} | ${p.description || "No description"}`).join("\n")
          : "No projects found.";

        const fullPersona = `
          # SYSTEM ROLE
          ${adminSettings.role || "You are Pascel AI, a helpful assistant."}
          
          # CAPABILITIES & SERVICES
          ${adminSettings.services || "N/A"}

          # CURRENT USER REAL-TIME DATA (INTERNAL DATABASE SOURCE)
          IMPORTANT: You have direct access to the following data. Never tell the user you cannot see their tasks, projects, or team info.
          
          Name: ${user.firstName} ${user.lastName || ""}
          Email: ${user.email}
          Team: ${user.teamName || "No team assigned"}
          Team ID: ${user._team || "N/A"}
          Role: ${user.isAdmin ? "Administrator" : "Employee"}

          ## ASSIGNED TASKS:
          ${formattedTasks}

          ## PERSONAL TODOS:
          ${formattedTodos}

          ## PROJECTS:
          ${formattedProjects}

          # OPERATIONAL RULES:
          1. If the user asks about their tasks, refer to the "ASSIGNED TASKS" section above.
          2. If they ask about their team, refer to the "CURRENT USER" section.
          3. If they ask about projects, refer to the "PROJECTS" section.
          4. NEVER invent data not present in this prompt.
        `;

        setContextData(fullPersona);
      } catch (err) {
        console.error("Error gathering AI context:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDataForAI();
  }, [user]);

  return (
    <div>
      <MobileNavbar title="Pascel AI"/>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#902ba9] mb-2"></div>
          <p>Pascel is remembering your data...</p>
        </div>
      ) : (
        <GroqChat user={user} userContext={contextData} />
      )}
    </div>
  );
}
