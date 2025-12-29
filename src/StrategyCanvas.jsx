import React, { useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, ArrowRight, ArrowLeft, BarChart3, Download } from 'lucide-react';

export default function StrategyCanvas() {
  const [step, setStep] = useState(1);
  const [factors, setFactors] = useState(['']);
  const [competitors, setCompetitors] = useState([{ name: 'Your Company', isOwn: true }]);
  const [ratings, setRatings] = useState({});
  const [newFactors, setNewFactors] = useState(['']);
  const [showNewFactors, setShowNewFactors] = useState(false);
  const chartRef = useRef(null);

  const colors = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777'];

  const addFactor = () => setFactors([...factors, '']);
  const removeFactor = (index) => setFactors(factors.filter((_, i) => i !== index));
  const updateFactor = (index, value) => {
    const updated = [...factors];
    updated[index] = value;
    setFactors(updated);
  };

  const addCompetitor = () => setCompetitors([...competitors, { name: '', isOwn: false }]);
  const removeCompetitor = (index) => setCompetitors(competitors.filter((_, i) => i !== index));
  const updateCompetitor = (index, value) => {
    const updated = [...competitors];
    updated[index].name = value;
    setCompetitors(updated);
  };

  const updateRating = (compIndex, factorIndex, value) => {
    setRatings({
      ...ratings,
      [`${compIndex}-${factorIndex}`]: parseInt(value)
    });
  };

  const addNewFactor = () => setNewFactors([...newFactors, '']);
  const removeNewFactor = (index) => setNewFactors(newFactors.filter((_, i) => i !== index));
  const updateNewFactor = (index, value) => {
    const updated = [...newFactors];
    updated[index] = value;
    setNewFactors(updated);
  };

  const prepareChartData = () => {
    return factors.filter(f => f.trim()).map((factor, factorIndex) => {
      const dataPoint = { factor: factor.length > 15 ? factor.substring(0, 15) + '...' : factor };
      competitors.forEach((comp, compIndex) => {
        if (comp.name.trim()) {
          dataPoint[comp.name] = ratings[`${compIndex}-${factorIndex}`] || 0;
        }
      });
      return dataPoint;
    });
  };

  const canProceedStep1 = factors.filter(f => f.trim()).length >= 3;
  const canProceedStep2 = competitors.filter(c => c.name.trim()).length >= 2;
  const canProceedStep3 = () => {
    const validCompetitors = competitors.filter(c => c.name.trim());
    const validFactors = factors.filter(f => f.trim());
    for (let c = 0; c < validCompetitors.length; c++) {
      for (let f = 0; f < validFactors.length; f++) {
        if (!ratings[`${c}-${f}`]) return false;
      }
    }
    return true;
  };

  const exportToPDF = async () => {
    const chartElement = chartRef.current;
    if (!chartElement) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartElement, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const pdfContainer = document.createElement('div');
      pdfContainer.style.width = '800px';
      pdfContainer.style.padding = '40px';
      pdfContainer.style.backgroundColor = 'white';
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      const title = document.createElement('h1');
      title.textContent = 'Strategy Canvas Analysis';
      title.style.fontSize = '24px';
      title.style.marginBottom = '20px';
      title.style.color = '#1f2937';
      pdfContainer.appendChild(title);
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.style.width = '100%';
      img.style.marginBottom = '20px';
      pdfContainer.appendChild(img);
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.marginBottom = '20px';
      table.style.fontSize = '12px';
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      headerRow.style.backgroundColor = '#f3f4f6';
      const thFactor = document.createElement('th');
      thFactor.textContent = 'Factor';
      thFactor.style.padding = '8px';
      thFactor.style.border = '1px solid #d1d5db';
      thFactor.style.textAlign = 'left';
      headerRow.appendChild(thFactor);
      competitors.filter(c => c.name.trim()).forEach(comp => {
        const th = document.createElement('th');
        th.textContent = comp.name;
        th.style.padding = '8px';
        th.style.border = '1px solid #d1d5db';
        th.style.textAlign = 'center';
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      const tbody = document.createElement('tbody');
      factors.filter(f => f.trim()).forEach((factor, factorIndex) => {
        const row = document.createElement('tr');
        const tdFactor = document.createElement('td');
        tdFactor.textContent = factor;
        tdFactor.style.padding = '8px';
        tdFactor.style.border = '1px solid #d1d5db';
        row.appendChild(tdFactor);
        competitors.filter(c => c.name.trim()).forEach((comp, compIndex) => {
          const td = document.createElement('td');
          td.textContent = ratings[`${compIndex}-${factorIndex}`] || '0';
          td.style.padding = '8px';
          td.style.border = '1px solid #d1d5db';
          td.style.textAlign = 'center';
          row.appendChild(td);
        });
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      pdfContainer.appendChild(table);
      const branding = document.createElement('div');
      branding.textContent = 'Created with stetteradvisory.com';
      branding.style.fontSize = '11px';
      branding.style.color = '#6b7280';
      branding.style.textAlign = 'center';
      branding.style.marginTop = '20px';
      pdfContainer.appendChild(branding);
      document.body.appendChild(pdfContainer);
      const pdfCanvas = await html2canvas(pdfContainer, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      document.body.removeChild(pdfContainer);
      const link = document.createElement('a');
      link.download = 'strategy-canvas.png';
      link.href = pdfCanvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting chart:', error);
      alert('There was an error exporting the chart. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Strategy Canvas Builder</h1>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s}
                  </div>
                  {s < 4 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Factors</span>
              <span>Competitors</span>
              <span>Ratings</span>
              <span>Results</span>
            </div>
          </div>

          {/* Step 1: Competitive Factors */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Define Your Competitive Factors</h2>
                <p className="text-gray-600 mb-6">What factors do you compete on? List at least 3 key characteristics that matter in your industry.</p>
              </div>

              <div className="space-y-3">
                {factors.map((factor, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={factor}
                      onChange={(e) => updateFactor(index, e.target.value)}
                      placeholder={`Factor ${index + 1} (e.g., Price, Quality, Customer Service)`}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {factors.length > 1 && (
                      <button onClick={() => removeFactor(index)} className="p-3 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={addFactor} className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium">
                <Plus className="w-5 h-5" /> Add Factor
              </button>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
                    canProceedStep1 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Competitors */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Identify Your Competitors</h2>
                <p className="text-gray-600 mb-6">List your main competitors. You can use real names or aliases.</p>
              </div>

              <div className="space-y-3">
                {competitors.map((comp, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={comp.name}
                      onChange={(e) => updateCompetitor(index, e.target.value)}
                      placeholder={comp.isOwn ? "Your Company Name" : `Competitor ${index}`}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={comp.isOwn}
                    />
                    {!comp.isOwn && (
                      <button onClick={() => removeCompetitor(index)} className="p-3 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={addCompetitor} className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium">
                <Plus className="w-5 h-5" /> Add Competitor
              </button>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300">
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
                    canProceedStep2 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Ratings */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Rate Each Factor</h2>
                <p className="text-gray-600 mb-4">Rate each competitor on every factor using the scale below:</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div><span className="font-semibold">0:</span> Not relevant / Non-existent</div>
                    <div><span className="font-semibold">1:</span> Very limited / Poor</div>
                    <div><span className="font-semibold">2:</span> Below average</div>
                    <div><span className="font-semibold">3:</span> Average / Moderate</div>
                    <div><span className="font-semibold">4:</span> Above average / Strong</div>
                    <div><span className="font-semibold">5:</span> Best in class / Exceptional</div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left font-semibold text-gray-700 border">Factor</th>
                      {competitors.filter(c => c.name.trim()).map((comp, index) => (
                        <th key={index} className="p-3 text-center font-semibold text-gray-700 border">{comp.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {factors.filter(f => f.trim()).map((factor, factorIndex) => (
                      <tr key={factorIndex} className="hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-800 border">{factor}</td>
                        {competitors.filter(c => c.name.trim()).map((comp, compIndex) => (
                          <td key={compIndex} className="p-3 border">
                            <select
                              value={ratings[`${compIndex}-${factorIndex}`] || ''}
                              onChange={(e) => updateRating(compIndex, factorIndex, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">-</option>
                              {[0, 1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300">
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!canProceedStep3()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold ${
                    canProceedStep3() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  View Results <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your Strategy Canvas</h2>
                  <p className="text-gray-600 mb-6">Visualize how you compare against your competitors across all factors.</p>
                </div>
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                >
                  <Download className="w-5 h-5" /> Export
                </button>
              </div>

              <div ref={chartRef} className="bg-gray-50 p-6 rounded-xl">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={prepareChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="factor" angle={-45} textAnchor="end" height={100} />
                    <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
                    <Tooltip />
                    <Legend />
                    {competitors.filter(c => c.name.trim()).map((comp, index) => (
                      <Line
                        key={index}
                        type="monotone"
                        dataKey={comp.name}
                        stroke={colors[index % colors.length]}
                        strokeWidth={3}
                        dot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-center text-sm text-gray-500 mt-4">
                  Created with stetteradvisory.com
                </div>
              </div>

              {!showNewFactors && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Explore New Opportunities</h3>
                  <p className="text-gray-700 mb-4">Are there new categories that may matter to your customers but aren't being addressed by you or your competitors?</p>
                  <button
                    onClick={() => setShowNewFactors(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Explore New Factors
                  </button>
                </div>
              )}

              {showNewFactors && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Potential New Competitive Factors</h3>
                  <p className="text-gray-700 mb-4">Think about what customers might value that isn't currently being competed on.</p>
                  
                  <div className="space-y-3">
                    {newFactors.map((factor, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={factor}
                          onChange={(e) => updateNewFactor(index, e.target.value)}
                          placeholder={`New factor ${index + 1} (e.g., Sustainability, Convenience)`}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                        {newFactors.length > 1 && (
                          <button onClick={() => removeNewFactor(index)} className="p-3 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button onClick={addNewFactor} className="flex items-center gap-2 px-4 py-2 mt-3 text-green-600 hover:bg-green-100 rounded-lg font-medium">
                    <Plus className="w-5 h-5" /> Add New Factor
                  </button>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(3)} className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300">
                  <ArrowLeft className="w-5 h-5" /> Edit Ratings
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setFactors(['']);
                    setCompetitors([{ name: 'Your Company', isOwn: true }]);
                    setRatings({});
                    setNewFactors(['']);
                    setShowNewFactors(false);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Start New Canvas
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>Based on the Blue Ocean Strategy Canvas framework</p>
        </div>
      </div>
    </div>
  );
}
