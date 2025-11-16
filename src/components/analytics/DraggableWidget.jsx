import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";

export default function DraggableWidget({ id, index, children }) {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`relative ${snapshot.isDragging ? 'z-50' : ''}`}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.8 : 1,
          }}
        >
          <div {...provided.dragHandleProps} className="absolute top-4 right-4 cursor-grab active:cursor-grabbing z-10 p-2 hover:bg-white/10 rounded-lg transition-colors">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          {children}
        </motion.div>
      )}
    </Draggable>
  );
}