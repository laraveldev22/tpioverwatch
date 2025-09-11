'use client';

import { useState, useRef } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from 'recharts';
import DashboardLayout from '../layout/DashboardLayout';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';

const graphTypes = ['Circles', 'Donut', 'Rectangles', 'Bars'];
const layoutTypes = ['Landscape', 'Portrait'];
const defaultFont = 'Roboto';

export default function DynamicGraph() {
    const [graphType, setGraphType] = useState('Circles');
    const [layout, setLayout] = useState('Landscape');
    const [font, setFont] = useState(defaultFont);
    const [gifName, setGifName] = useState('');
    const [variables, setVariables] = useState([
        { name: 'Variable 1', value: 100, color: '#8884d8' },
        { name: 'Variable 2', value: 200, color: '#82ca9d' },
    ]);

    const graphRef = useRef<HTMLDivElement>(null);

    const handleAddVariable = () => {
        if (variables.length < 5) {
            setVariables([...variables, { name: '', value: 0, color: '#ffc658' }]);
        }
    };

    const handleVariableChange = (index: number, field: string, value: any) => {
        const updated = [...variables];
        updated[index][field] = field === 'value' ? Number(value) : value;
        setVariables(updated);
    };

    const handleExportImage = () => {
        if (graphRef.current) {
            htmlToImage.toCanvas(graphRef.current).then((canvas) => {
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const watermarkImg = new Image();
                watermarkImg.src = '/logo2.png'; // Put watermark in public folder
                watermarkImg.onload = () => {
                    const scale = 0.2; // scale watermark relative to canvas
                    const w = watermarkImg.width * scale;
                    const h = watermarkImg.height * scale;
                    const x = canvas.width - w - 10; // 10px padding from right
                    const y = 10; // 10px padding from top
                    ctx.drawImage(watermarkImg, x, y, w, h);

                    // Convert canvas back to PNG and download
                    canvas.toBlob((blob) => {
                        if (blob) download(blob, `${gifName || 'graph'}.png`);
                    });
                };
            });
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen p-10" style={{ fontFamily: font }}>
                <h1 className="text-4xl text-black font-bold mb-8">📊 Compare the Numbers</h1>
                <p className="mb-8 text-black">
                    Start by naming your GIF, adding variables, and choosing their color.
                </p>

                <div className="flex gap-8">
                    {/* Left Side: Inputs */}
                    <div className="w-1/3 bg-[#1F234B] rounded-lg shadow-lg p-6 space-y-6">
                        <label className="block text-white font-semibold">🎬 GIF Name</label>
                        <input
                            type="text"
                            maxLength={96}
                            value={gifName}
                            onChange={(e) => setGifName(e.target.value)}
                            className="w-full p-3 rounded bg-[#2C3055] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter GIF name"
                        />

                        <label className="block text-white font-semibold">🅰️ Font</label>
                        <select
                            value={font}
                            onChange={(e) => setFont(e.target.value)}
                            className="w-full p-3 rounded bg-[#2C3055] text-white"
                        >
                            <option value="Roboto">Roboto</option>
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                        </select>

                        <div className="space-y-4">
                            {variables.map((variable, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <input
                                        type="text"
                                        maxLength={72}
                                        value={variable.name}
                                        onChange={(e) =>
                                            handleVariableChange(index, 'name', e.target.value)
                                        }
                                        placeholder="Variable Name"
                                        className="flex-1 p-2 rounded bg-[#2C3055] text-white"
                                    />
                                    <input
                                        type="number"
                                        value={variable.value}
                                        onChange={(e) =>
                                            handleVariableChange(index, 'value', e.target.value)
                                        }
                                        placeholder="Value"
                                        className="p-2 rounded bg-[#2C3055] text-white w-24"
                                    />
                                    <input
                                        type="color"
                                        value={variable.color}
                                        onChange={(e) =>
                                            handleVariableChange(index, 'color', e.target.value)
                                        }
                                        className="w-10 h-10 rounded"
                                    />
                                </div>
                            ))}
                            <button
                                onClick={handleAddVariable}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                ➕ Add Variable
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {graphTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setGraphType(type)}
                                    className={`px-4 py-2 rounded shadow ${graphType === type
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-500 text-gray-200'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-4">
                            {layoutTypes.map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setLayout(l)}
                                    className={`px-4 py-2 rounded shadow ${layout === l
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-500 text-gray-200'
                                        }`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleExportImage}
                            className="w-full mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            📥 Export as Image
                        </button>
                    </div>

                    {/* Right Side: Graph Preview */}
                    <div
                        ref={graphRef}
                        className="w-2/3 bg-[#1F234B] rounded-lg shadow-lg p-6"
                        style={{ padding: '20px' }}
                    >
                        <div
                            style={{
                                width: '100%',
                                height: layout === 'Landscape' ? '400px' : '600px',
                            }}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                {graphType === 'Circles' && (
                                    <PieChart>
                                        <Pie data={variables} dataKey="value" outerRadius={80}>
                                            {variables.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                )}

                                {graphType === 'Donut' && (
                                    <PieChart>
                                        <Pie
                                            data={variables}
                                            dataKey="value"
                                            innerRadius={80}
                                            outerRadius={150}
                                        >
                                            {variables.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                )}

                                {(graphType === 'Rectangles' || graphType === 'Bars') && (
                                    <BarChart data={variables}>
                                        <XAxis dataKey="name" stroke="#FFFFFF" />
                                        <YAxis stroke="#FFFFFF" />
                                        <Bar
                                            dataKey="value"
                                            barSize={graphType === 'Bars' ? 30 : undefined}
                                        >
                                            {variables.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
