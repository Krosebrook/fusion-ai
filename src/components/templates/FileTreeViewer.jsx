import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Folder, FolderOpen, FileText, FileCode, FileJson, 
  FileImage, ChevronRight, ChevronDown
} from "lucide-react";

const easeInOutCubic = [0.4, 0, 0.2, 1];

const getFileIcon = (path) => {
  const ext = path.split('.').pop().toLowerCase();
  const iconProps = { className: "w-4 h-4" };
  
  if (ext === 'json') return <FileJson {...iconProps} className="w-4 h-4 text-yellow-400" />;
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java'].includes(ext)) return <FileCode {...iconProps} className="w-4 h-4 text-blue-400" />;
  if (['png', 'jpg', 'jpeg', 'svg', 'gif'].includes(ext)) return <FileImage {...iconProps} className="w-4 h-4 text-purple-400" />;
  return <FileText {...iconProps} className="w-4 h-4 text-gray-400" />;
};

const buildTree = (files) => {
  const root = { name: 'root', children: {}, files: [], isFolder: true };
  
  files.forEach((file) => {
    const parts = file.path.split('/').filter(Boolean);
    let current = root;
    
    parts.forEach((part, index) => {
      const isLastPart = index === parts.length - 1;
      
      if (isLastPart) {
        // It's a file
        current.files.push({ 
          name: part, 
          description: file.description,
          path: file.path,
          isFolder: false 
        });
      } else {
        // It's a folder
        if (!current.children[part]) {
          current.children[part] = { 
            name: part, 
            children: {}, 
            files: [], 
            isFolder: true 
          };
        }
        current = current.children[part];
      }
    });
  });
  
  return root;
};

const TreeNode = ({ node, depth = 0, index = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels
  const hasChildren = Object.keys(node.children).length > 0 || node.files.length > 0;
  
  const toggleExpand = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };
  
  const childrenArray = [
    ...Object.values(node.children).sort((a, b) => a.name.localeCompare(b.name)),
    ...node.files.sort((a, b) => a.name.localeCompare(b.name))
  ];

  return (
    <div>
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          delay: index * 0.02, 
          duration: 0.4, 
          ease: easeInOutCubic 
        }}
        onClick={toggleExpand}
        className="w-full flex items-start gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-all group"
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        {/* Expand/Collapse Icon */}
        {hasChildren && (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.3, ease: easeInOutCubic }}
            className="flex-shrink-0 mt-0.5"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </motion.div>
        )}
        
        {!hasChildren && <div className="w-4" />}
        
        {/* Folder/File Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {node.isFolder ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-orange-400" />
            ) : (
              <Folder className="w-4 h-4 text-orange-400" />
            )
          ) : (
            getFileIcon(node.name)
          )}
        </div>
        
        {/* File/Folder Info */}
        <div className="flex-1 text-left min-w-0">
          <p className={`text-sm font-medium truncate ${
            node.isFolder ? 'text-white' : 'text-cyan-400'
          }`}>
            {node.name}
          </p>
          {node.description && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-xs text-gray-500 mt-0.5 leading-relaxed"
            >
              {node.description}
            </motion.p>
          )}
        </div>
      </motion.button>
      
      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: 'auto', 
              opacity: 1,
              transition: {
                height: { duration: 0.3, ease: easeInOutCubic },
                opacity: { duration: 0.2, delay: 0.1 }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: {
                height: { duration: 0.3, ease: easeInOutCubic },
                opacity: { duration: 0.1 }
              }
            }}
            className="overflow-hidden"
          >
            {childrenArray.map((child, idx) => (
              <TreeNode 
                key={child.name} 
                node={child} 
                depth={depth + 1}
                index={idx}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FileTreeViewer({ files }) {
  const tree = useMemo(() => buildTree(files), [files]);
  
  return (
    <div className="font-mono text-sm">
      {Object.values(tree.children).map((child, idx) => (
        <TreeNode key={child.name} node={child} index={idx} />
      ))}
      {tree.files.map((file, idx) => (
        <TreeNode 
          key={file.name} 
          node={file} 
          index={Object.keys(tree.children).length + idx} 
        />
      ))}
    </div>
  );
}