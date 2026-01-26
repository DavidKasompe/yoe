"use client";

import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const TASKS = [
  { id: 1, name: "Andryi Yarmolenko", type: "Full", progress: 50, priority: "Medium", assignee: "Ryan", avatar: "bg-blue-600" },
  { id: 2, name: "Denys Boyko", type: "Match", progress: 100, priority: "Urgent", assignee: "Adam", avatar: "bg-green-600" },
  { id: 3, name: "Arthur Rydko", type: "Full", progress: 50, priority: "Low", assignee: "Carla", avatar: "bg-purple-600" },
  { id: 4, name: "Sergyi Sidorchuk", type: "Full", progress: 50, priority: "Low", assignee: "Micha", avatar: "bg-red-600" },
  { id: 5, name: "Valery Bondarenko", type: "Match", progress: 100, priority: "Medium", assignee: "Rona", avatar: "bg-orange-600" },
];

export function ScoutTaskTable() {
  return (
    <div className="bg-[#1E1E1E] rounded-3xl p-6 mt-6">
       <div className="flex justify-between items-center mb-6">
           <h3 className="text-white font-bold">Tasks</h3>
           <button className="bg-yellow-400 text-black px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-300 transition-colors">
               Add Task +
           </button>
       </div>

       <div className="space-y-1">
           {/* Header */}
           <div className="grid grid-cols-12 gap-4 text-[10px] font-bold text-neutral-500 uppercase px-4 pb-2 border-b border-[#333]">
               <div className="col-span-4"># Task Name</div>
               <div className="col-span-2">Type</div>
               <div className="col-span-2">Progress</div>
               <div className="col-span-2">Priority</div>
               <div className="col-span-2">Assigned To</div>
           </div>

           {/* Rows */}
           {TASKS.map((task, i) => (
             <div key={task.id} className="grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-[#252525] rounded-xl transition-colors group cursor-pointer">
                 <div className="col-span-4 text-white text-sm font-medium flex items-center gap-3">
                     <span className="text-neutral-600 w-4">{i + 1}</span>
                     {task.name}
                 </div>
                 <div className="col-span-2">
                     <div className="flex items-center gap-2">
                         <div className={cn("w-2 h-2 rounded-full", task.type === "Full" ? "bg-yellow-400" : "bg-neutral-400")} />
                         <span className="text-neutral-300 text-xs">{task.type}</span>
                     </div>
                 </div>
                 <div className="col-span-2 flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                     <span className="text-neutral-300 text-xs">{task.progress}%</span>
                 </div>
                 <div className="col-span-2">
                     <span className={cn(
                         "text-[10px] font-bold uppercase",
                         task.priority === "Urgent" ? "text-red-500" :
                         task.priority === "Medium" ? "text-yellow-500" : "text-green-500"
                     )}>• {task.priority}</span>
                 </div>
                 <div className="col-span-2 flex items-center gap-2 justify-between">
                     <div className="flex items-center gap-2">
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white font-bold", task.avatar)}>
                            {task.assignee.charAt(0)}
                        </div>
                        <span className="text-white text-xs hidden xl:block">{task.assignee}</span>
                     </div>
                     <button className="bg-[#333] hover:bg-yellow-400 hover:text-black text-white text-[10px] px-2 py-1 rounded transition-colors opacity-0 group-hover:opacity-100">
                         Change
                     </button>
                 </div>
             </div>
           ))}
       </div>
    </div>
  );
}
