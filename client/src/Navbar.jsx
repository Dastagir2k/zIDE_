import React from 'react';
import Select from 'react-select';
// import './Navbar.css';

const Navbar = ({ userLang, setUserLang, userTheme, setUserTheme, fontSize, setFontSize }) => {
    const languages = [
        { value: "c", label: "C" },
        { value: "cpp", label: "C++" },
        { value: "python", label: "Python" },
        { value: "java", label: "Java" },
    ];

    const themes = [
        { value: "vs-dark", label: "Dark" },
        { value: "light", label: "Light" },
    ];

    return (
        <div className="navbar bg-gray-800 text-white flex justify-between items-center p-4">
            <h1 className="font-bold text-xl">Geeks Code Compiler</h1>
            <div className="flex items-center space-x-4">
                <Select
                    options={languages}
                    value={languages.find(lang => lang.value === userLang)}
                    onChange={(e) => setUserLang(e.value)}
                    placeholder="Select Language"
                    className="w-48"
                />
                <Select
                    options={themes}
                    value={themes.find(theme => theme.value === userTheme)}
                    onChange={(e) => setUserTheme(e.value)}
                    placeholder="Select Theme"
                    className="w-32"
                />
                <div className="flex items-center space-x-2">
                    <label className="text-sm">Font Size</label>
                    <input
                        type="range"
                        min="18"
                        max="30"
                        value={fontSize}
                        step="2"
                        onChange={(e) => setFontSize(e.target.value)}
                        className="h-2 w-32 bg-gray-600"
                    />
                </div>
            </div>
        </div>
    );
};

export default Navbar;
