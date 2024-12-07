import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import Axios from "axios";
import spinner from "./spinner.svg";
import { useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

function App() {
  const [tabs, setTabs] = useState([
    {
      id: 1,
      name: "Editor 1",
      code: "// Your code here",
      language: "javascript",
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [userInput, setUserInput] = useState("");
  const [userOutput, setUserOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setaiLoading] = useState(false);
  const [aicode, setAiCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [userTheme, setUserTheme] = useState("vs-dark");
  const [searchParams] = useSearchParams();
  const [userId, setUserId] = useState("");

  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const options = { fontSize: 16 };

  useEffect(() => {
    const userid = searchParams.get("userid");
    if (userid != null) {
      setUserId(userid); // Store the user ID
      console.log("welcome user not null: ", userId);
    }
  }, [searchParams]);

  console.log("welcome user : ", userId);

  const updateCode = (value) => {
    setTabs(
      tabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, code: value } : tab
      )
    );
  };

  const addTab = () => {
    const newTab = {
      id: tabs.length + 1,
      name: `Editor ${tabs.length + 1}`,
      code: "//Your code here",
      language: "javascript",
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const removeTab = (id) => {
    if (tabs.length === 1) return;
    const updatedTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(updatedTabs);
    if (id === activeTabId) {
      setActiveTabId(updatedTabs[0]?.id || 0);
    }
  };

  const compile = async () => {
    console.log(activeTab.code);

    if (!activeTab || !activeTab.code) {
      setUserOutput("Please write some code to compile.");
      return;
    }
    setLoading(true);
    try {
      const res = await Axios.post("https://zide-zb0z.onrender.com/compile", {
        language: activeTab.language,
        code: activeTab.code,
        input: userInput,
        userId: userId,
      });
      console.log(res.data.output);

      setUserOutput(res.data.output || res.data.error || "Unknown Error");
    } catch (error) {
      setUserOutput(`Errorrrr: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeCode = async () => {
    setaiLoading(true);
    try {
      const res = await Axios.post("https://zide-zb0z.onrender.com/optimize", {
        code: activeTab.code,
      });

      setAiCode(res.data.code);
      console.log(aicode);
    } catch (error) {
      setAiCode(`Error: ${error.message}`);
    } finally {
      setaiLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(aicode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-indigo-600 to-pink-600 px-4 py-2 shadow-md flex justify-between items-center">
        {/* App Logo */}
        <div className="text-4xl font-extrabold text-white flex items-center">
          <span className="text-red-500">z</span>
          <span className="text-green-500">I</span>
          <span className="text-blue-500">D</span>
          <span className="text-yellow-500">E</span>
          <span className="ml-2 text-xs text-gray-300">Code Editor</span>
        </div>

        {/* Dropdown & Theme Toggle */}
        <div className="flex items-center space-x-3">
          <select
            className="bg-gray-800 text-white p-2 rounded-md"
            value={activeTab?.language || "python"}
            onChange={(e) =>
              setTabs(
                tabs.map((tab) =>
                  tab.id === activeTabId
                    ? { ...tab, language: e.target.value }
                    : tab
                )
              )
            }
          >
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="javascript">Javascript</option>
          </select>
          <button
            onClick={() =>
              setUserTheme(userTheme === "vs-dark" ? "vs" : "vs-dark")
            }
            className="bg-gray-700 px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Toggle Theme
          </button>
        </div>
      </nav>

      {/* Toolbar */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        {/* Add Tab Button */}
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500"
          onClick={addTab}
        >
          + Add Tab
        </button>

        {/* Action Buttons */}
        <div className="space-x-2">
          <button
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
            onClick={compile}
          >
            Run Code
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            onClick={() => setUserOutput("")}
          >
            Clear Output
          </button>
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
            onClick={handleOptimizeCode}
          >
            Optimize Code
          </button>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Vertical Tab Bar */}
        <div className="w-1/5 bg-gray-800 text-gray-300 flex flex-col py-4">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`px-4 py-2 cursor-pointer rounded-md mb-2 ${
                tab.id === activeTabId
                  ? "bg-indigo-500 text-white"
                  : "hover:bg-gray-700"
              }`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <div className="flex items-center justify-between">
                <span>{tab.name}</span>
                <button
                  className="text-gray-500 hover:text-black font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTab(tab.id);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Editor Section */}
        <div className="flex-1 flex flex-col">
          <Editor
            height="calc(100vh - 150px)"
            theme={userTheme}
            language={activeTab?.language || "javascript"}
            value={activeTab?.code || ""}
            options={options}
            onChange={(value) => updateCode(value)}
          />

          {/* Input & Output */}
          <div className="flex px-6 py-4 bg-gray-800">
            {/* Input */}
            <div className="w-1/2 px-4">
              <h4 className="text-lg font-semibold mb-2">Input</h4>
              <textarea
                className="w-full bg-gray-700 text-white p-3 rounded-md h-32 resize-none"
                placeholder="Enter input for the code"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              ></textarea>
            </div>

            {/* Output */}
            <div className="w-1/2 px-4">
              <h4 className="text-lg font-semibold mb-2">Output</h4>
              <div className="bg-gray-700 text-white p-3 rounded-md h-32 overflow-y-auto overflow-x-hidden">
                {loading ? (
                  <div className="flex justify-center items-center">
                    <img src={spinner} alt="Loading..." className="h-12 w-12" />
                  </div>
                ) : (
                  <pre>{userOutput}</pre>
                )}
              </div>
            </div>

            {/* Ai Code */}
            <div className="w-1/2 px-4">
              <h4 className="text-lg font-semibold mb-2">Ai </h4>
              <div className="bg-gray-700 text-white p-3 rounded-md h-32 overflow-y-auto overflow-x-hidden">
                {aiLoading ? (
                  <div className="whitespace-pre-wrap">
                    <img src={spinner} alt="Loading..." className="h-12 w-12" />
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap">
                    {aicode || "Optimized code will appear here."}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
