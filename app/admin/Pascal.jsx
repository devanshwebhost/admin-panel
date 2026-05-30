'use client';

import { useEffect, useState } from "react";
import GroqChat from "@/components/GroqChat";
import MobileNavbar from "@/components/MobileNavbar";

export default function Pascel({user}) {
  // 💡 NAYA LOGIC: Session Storage se purana context uthao taaki load time zero ho jaye
  const [contextData, setContextData] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(`pascel_context_${user?._id}`) || "";
    }
    return "";
  });

  // Agar context pehle se cache me hai, toh UI ko block mat karo (false kar do)
  const [isLoading, setIsLoading] = useState(!contextData);
  const [projects, setProjects] = useState([]);

  const fetchUserDataForAI = async () => {
    if (!user?._id) return "";

    try {
      const adminRes = await fetch("/api/admin");
      const adminSettings = adminRes.ok ? await adminRes.json() : {};

      const todoRes = await fetch(`/api/userTodos?userId=${user._id}`);
      const todoJson = await todoRes.json();
      const todos = todoJson.myTodos || [];

      const taskRes = await fetch(`/api/tasks?assignedTo=${user._id}`);
      const taskJson = await taskRes.json();
      const tasks = taskJson.tasks || [];

      let fetchedProjects = [];
      try {
        const projectRes = await fetch("/api/projects");
        if (projectRes.ok) {
          const projectJson = await projectRes.json();
          fetchedProjects = projectJson.projects || [];
        }
      } catch (err) {
        console.error("Project fetch failed:", err);
      }
      setProjects(fetchedProjects);

      const formattedTodos = todos.length > 0 
        ? todos.map(t => `- ID: ${t._id} | Task: ${t.text} | Status: ${t.completed ? 'Completed' : 'Pending'}`).join("\n")
        : "No personal todos.";

      const formattedTasks = tasks.length > 0
        ? tasks.map(t => `- Task: ${t.title} | Status: ${t.status} | Deadline: ${new Date(t.dueDate).toLocaleDateString()}`).join("\n")
        : "No professional tasks assigned.";

      const formattedProjects = fetchedProjects.length > 0
        ? fetchedProjects.map(p => `- Project: ${p.name || p.title} | ${p.description || "No description"}`).join("\n")
        : "No projects found.";

      const fullPersona = `
        # SYSTEM ROLE
        ${adminSettings.role || "You are Pascel, the official AI Agent of Indocs Media."}
        
        # CURRENT USER DATA
        Name: ${user.firstName} ${user.lastName || ""}
        Role: ${user.isAdmin ? "Administrator" : "Employee"}

        ## ASSIGNED TASKS (Professional):
        ${formattedTasks}

        ## PERSONAL TODOS:
        ${formattedTodos}

        ## PROJECTS:
        ${formattedProjects}

        # 🚨 STRICT BEHAVIOR RULES (MUST FOLLOW TO SAVE TOKENS) 🚨
        1. **BE EXTREMELY CONCISE:** Answer strictly what the user asks. If they ask for "assignments" or "tasks", ONLY discuss ASSIGNED TASKS. Do NOT mention PERSONAL TODOS unless they specifically ask for them.
        2. **NEVER SHOW IDs:** You will see MongoDB Object IDs (e.g., 6a19c0a...) in the data above. NEVER print these IDs in your conversational text. They look ugly to the user.
        3. **HANDLE EMPTY STATES:** If the user asks for assignments and there are none, simply say: "You have no professional tasks assigned at the moment." Do not over-explain.
        4. **NO ROBOTIC LISTS:** When listing things, make it sound natural and human. Do not say "Status: Pending", just say "You need to..." or use bullet points cleanly.

        # 🛠️ ACTION COMMANDS (HIDDEN ACTIONS)
        You can manage the user's Personal Todos using these EXACT hidden tags. The frontend will silently process them.

        - To ADD a todo: [[ACTION:ADD_TODO: task_name]]
        - To DELETE a todo: [[ACTION:DELETE_TODO: exact_id]]
        - To TOGGLE completion: [[ACTION:TOGGLE_TODO: exact_id]]
      `;

      setContextData(fullPersona);
      
      // 💡 Har fresh fetch ke baad usko cache me save kar lo
      sessionStorage.setItem(`pascel_context_${user._id}`, fullPersona); 
      return fullPersona; 

    } catch (err) {
      console.error("Error gathering AI context:", err);
      return contextData; 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Ye function ab silent background me chalega bina screen block kiye
    fetchUserDataForAI();
  }, [user]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[#131314]">
      <MobileNavbar title="Pascel AI"/>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center flex-grow text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-2"></div>
          <p className="text-sm">Pascel is waking up...</p>
        </div>
      ) : (
        <GroqChat user={user} userContext={contextData} refreshContext={fetchUserDataForAI} />
      )}
    </div>
  );
}