import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import Axios from "axios";
import spinner from "./spinner.svg";
import { useParams } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import logo from "./gmini.png";
import zide from "./zide.jpg";
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
  const [searchParams] = useSearchParams();
  const [userId, setUserId] = useState("");
  const axiosInstance = Axios.create({
    timeout: 10000, // Set timeout to 10 seconds (10000ms)
  });
  useEffect(() => {
    const userid = searchParams.get("userid");
    if (userid != null) {
      setUserId(userid); // Store the user ID
      console.log("welcome user not null: ", userId);
    }
  }, [searchParams]);

  console.log("welcome user : ", userId);

  // State variables
  const [userCode, setUserCode] = useState(""); // User code
  const [userLang, setUserLang] = useState("python"); // Language selected
  const [userTheme, setUserTheme] = useState("vs-dark"); // Theme selected
  const [fontSize, setFontSize] = useState(20); // Font size for the editor
  const [userInput, setUserInput] = useState(""); // User input for the code
  const [userOutput, setUserOutput] = useState(""); // Output from the code
  const [loading, setLoading] = useState(false); // Loading state for the API call
  const [aiLoading, setaiLoading] = useState(false); // laading state for the ai code
  const [aicode, setAiCode] = useState(""); // analyse the code using gemini ai
  const [copied, setCopied] = useState(false);

  // Add a new tab
  const addTab = () => {
    const newTab = {
      id: tabs.length + 1,
      name: `Editor ${tabs.length + 1}`,
      code: "//Your code here",
      language: "python",
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };
  
  const removeTab = (id) => {
    if (tabs.length === 1) return; // Prevent removing the last tab
    const updatedTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(updatedTabs);
    if (id === activeTabId) {
      setActiveTabId(updatedTabs[0]?.id || 0); // Set a new active tab if current is removed
    }
  };
  

  // Update code in the current active tab
  const updateCode = (value) => {
    setTabs(
      tabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, code: value } : tab
      )
    );
  };

  // Get the active tab's data
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  // Monaco Editor options
  const options = {
    fontSize: fontSize,
  };

  // Monaco editor will mount
  function handleEditorWillMount(monaco) {
    monaco.languages.registerCompletionItemProvider("python", {
      provideCompletionItems: () => {
        const suggestions = [
          {
            label: "print",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "print(${1})",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Outputs a message to the console.",
          },
          {
            label: "input",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "input(${1})",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Gets user input.",
          },
          {
            label: "for loop",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "for i in range(${1}):\n\t${2}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Python for loop.",
          },
        ];
        return { suggestions: suggestions };
      },
    });
  }

  // Function to call the compile endpoint
  async function compile() {
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

      if (res.data.error) {
        setUserOutput("Error: " + res.data.error);
      } else {
        setUserOutput(res.data.output); // Show the output
      }
    } catch (err) {
      setUserOutput(
        "Error: " + (err.response ? err.response.data.error : err.message)
      );
    } finally {
      setLoading(false); // Stop loading spinner
    }
  }

  const handleOptimizeCode = async () => {
    setaiLoading(true);
    const responseCode = await axios.post(
      "https://zide-zb0z.onrender.com/optimize",
      {
        code: activeTab.code,
      }
    );
    setAiCode(responseCode.data.code);
    console.log(aicode);
    setaiLoading(false);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(aicode);
      setCopied(true);
      console.log("Code copied!");
    } catch (err) {
      console.log("Error on Copied code", err);
    }
  };

  // Function to clear the output screen
  function clearOutput() {
    setUserOutput("");
  }

  // Add state for theme icon
  const [themeIcon, setThemeIcon] = useState(
    "https://www.pngfind.com/pngs/m/75-759829_png-file-svg-night-mode-icon-download-transparent.png"
  );

  // Toggle theme function
  const toggleTheme = () => {
    if (userTheme === "vs-dark") {
      setUserTheme("vs");
      setThemeIcon("https://static.thenounproject.com/png/4808961-200.png"); // Light mode image
    } else {
      setUserTheme("vs-dark");
      setThemeIcon(
        "https://www.pngfind.com/pngs/m/75-759829_png-file-svg-night-mode-icon-download-transparent.png"
      ); // Dark mode image
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500 shadow-lg px-6 py-2 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-4">
          <span className="text-4xl font-extrabold text-white shadow-inner">
            <span className="text-red-500">z</span>
            <span className="text-green-500">I</span>
            <span className="text-blue-500">D</span>
            <span className="text-yellow-500">E</span>
            <span className="ml-2 text-lg text-gray-200">Compiler</span>
          </span>
        </div>

        {/* Dropdown and Theme Toggle Section */}
        <div className="flex items-center space-x-6">
          {/* Language Selector */}
          <select
            className="p-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-300 rounded-md shadow focus:outline-none focus:ring focus:ring-indigo-300 transition"
            value={activeTab?.language || "javascript"} // Use tab's language
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

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 shadow-md transition ease-in-out duration-300 transform hover:scale-105"
          >
            <img src={themeIcon} alt="Theme Toggle" className="h-6 w-6" />
          </button>
        </div>
      </nav>
      {/* Tab Navigation */}
      <div className="tab-bar flex space-x-10 bg-yellow-500 text-black">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? "active" : ""}`}
            onClick={() => setActiveTabId(tab.id)}
          >
            {tab.name}
            <button
              className="close-tab"
              onClick={(e) => {
                e.stopPropagation();
                removeTab(tab.id);
              }}
            >
              ✕
            </button>
          </div>
        ))}
        <button className="add-tab" onClick={addTab}>
          + Add Tab
        </button>
      </div>

      <div className="flex h-screen">
        {/* Left Container - Code Editor */}
        <div className="w-2/3 p-4">
          <Editor
            height="calc(100vh - 150px)"
            width="100%"
            theme={userTheme}
            language={activeTab?.language || "javascript"} // Use tab's language
            value={activeTab?.code || ""} // Use tab's code
            options={options}
            onChange={(value) => updateCode(value)} // Update the active tab's code
            beforeMount={handleEditorWillMount}
          />
          <div className="flex flex-row  justify-between">
            <button
              className="mt-4 bg-teal-500 text-white h-10  w-16 rounded-md hover:bg-teal-600"
              onClick={compile}
            >
              Run
            </button>
            <button
              className="mt-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-6 py-3 rounded-full flex items-center justify-center space-x-4 hover:shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out"
              onClick={handleOptimizeCode}
            >
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold">Optimize with</span>
                <img
                  src={logo}
                  alt="Gemini Logo"
                  className="w-16 h-12 rounded-full border-4 border-white"
                />
              </div>
            </button>
          </div>
        </div>

        {/* Right Container - Input & Output */}
        <div className="w-1/3 p-4">
          <h4 className="text-xl font-semibold">Input:</h4>
          <textarea
            className="w-full p-2 bg-gray-200 dark:bg-gray-700 border rounded-md"
            rows="6"
            placeholder="Enter input for the code"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          ></textarea>

          <h4 className="mt-4 text-xl font-semibold">Output:</h4>
          <div
            className="output-box bg-gray-100 dark:bg-gray-800 p-4 rounded-md border border-gray-300 overflow-y-auto"
            style={{ maxHeight: "200px" }} // Adjust the max height as needed
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <img
                  src={spinner}
                  alt="Loading..."
                  className="h-12 w-12 text-white"
                />
              </div>
            ) : (
              <pre className="whitespace-pre-wrap break-words">
                {userOutput}
              </pre>
            )}
          </div>
          <button
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            onClick={clearOutput}
          >
            Clear
          </button>

          <h4 className="mt-4 text-xl font-semibold">AI:</h4>
          <div className="output-box bg-gray-100 dark:bg-gray-800 p-4 rounded-md border border-gray-300 max-h-56 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{aicode}</pre>
            {aiLoading ? (
              <div className="flex justify-center items-center">
                <img
                  src={spinner}
                  alt="Loading..."
                  className="h-12 w-12 text-white"
                />
              </div>
            ) : (
              <button
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                onClick={handleCopyCode}
              >
                <pre className="whitespace-pre-wrap break-words">
                  {copied ? "copied!" : "copy"}
                </pre>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
