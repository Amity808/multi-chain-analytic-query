"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaxSummaryCards } from "@/components/tax/tax-summary-cards"
import { TaxableEventsTable } from "@/components/tax/taxable-events-table"
import { TaxReportWizard } from "@/components/tax/tax-report-wizard"
import { getNoditClient, type TaxReportRequest } from "@/lib/nodit"
import { CalendarIcon, FileText, Download, Mail, Save, AlertCircle, Info, Calculator, HelpCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "UK", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "JP", label: "Japan" },
  { value: "SG", label: "Singapore" },
]

const COST_BASIS_METHODS = [
  { value: "fifo", label: "FIFO (First In, First Out)", description: "Most common method" },
  { value: "lifo", label: "LIFO (Last In, First Out)", description: "May reduce short-term gains" },
  { value: "average_cost", label: "Average Cost", description: "Simplified calculation" },
]

const NETWORKS = [
  { id: "ethereum", name: "Ethereum" },
  { id: "bsc", name: "BSC" },
  { id: "tron", name: "Tron" },
  { id: "arbitrum", name: "Arbitrum" },
  { id: "polygon", name: "Polygon" },
  { id: "optimism", name: "Optimism" },
]

export default function TaxReportPage() {
  // Form state
  const [address, setAddress] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [country, setCountry] = useState("")
  const [costBasisMethod, setCostBasisMethod] = useState("fifo")
  const [network, setNetwork] = useState("ethereum")
  const [showWizard, setShowWizard] = useState(false)

  // Report generation state
  const [reportRequest, setReportRequest] = useState<TaxReportRequest | null>(null)
  const [progress, setProgress] = useState(0)

  const noditClient = getNoditClient()

  // Generate tax report query
  const {
    data: taxReport,
    isLoading: isGenerating,
    error: reportError,
    refetch: generateReport,
  } = useQuery({
    queryKey: ["tax-report", reportRequest],
    queryFn: async () => {
      if (!reportRequest) return null

      // Simulate progress updates
      setProgress(20)
      await new Promise((resolve) => setTimeout(resolve, 500))

      setProgress(40)
      const report = await noditClient.generateTaxReport(reportRequest)

      setProgress(80)
      await new Promise((resolve) => setTimeout(resolve, 300))

      setProgress(100)
      return report
    },
    enabled: !!reportRequest,
    staleTime: 0, // Always refetch
  })

  // Form validation
  const isFormValid = address && startDate && endDate && country && costBasisMethod && network

  // Handle form submission
  const handleGenerateReport = () => {
    if (!isFormValid) return

    const request: TaxReportRequest = {
      address: address.trim(),
      start_date: format(startDate!, "yyyy-MM-dd"),
      end_date: format(endDate!, "yyyy-MM-dd"),
      country,
      cost_basis_method: costBasisMethod as "fifo" | "lifo" | "average_cost",
      chain: network,
      network: "mainnet", // Default to mainnet
    }

    setReportRequest(request)
    setProgress(0)
  }

  // Export functions
  const exportToCSV = () => {
    if (!taxReport) return

    const csvContent = [
      ["Date", "Type", "Token", "Amount", "Price USD", "Cost Basis", "Proceeds", "Gain/Loss", "Classification"].join(
        ",",
      ),
      ...taxReport.taxable_events.map((event) =>
        [
          event.timestamp,
          event.type,
          event.token_symbol,
          event.amount.toString(),
          event.price_usd.toString(),
          event.cost_basis?.toString() || "",
          event.proceeds?.toString() || "",
          event.gain_loss?.toString() || "",
          event.classification,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tax-report-${reportRequest?.address}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToPDF = () => {
    // In a real implementation, you'd use a PDF library like jsPDF
    alert("PDF export would be implemented with a library like jsPDF")
  }

  const saveReport = () => {
    if (!taxReport) return

    const reportData = JSON.stringify(taxReport, null, 2)
    const blob = new Blob([reportData], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tax-report-${reportRequest?.address}-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const emailReport = () => {
    // In a real implementation, you'd integrate with an email service
    alert("Email functionality would be implemented with an email service")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Crypto Tax Report Generator</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Generate comprehensive tax reports for your crypto transactions
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button variant="outline" onClick={() => setShowWizard(true)}>
              <HelpCircle className="h-4 w-4 mr-2" />
              Help Wizard
            </Button>
          </div>
        </div>

        {/* Tax Report Wizard Modal */}
        {showWizard && (
          <TaxReportWizard
            onClose={() => setShowWizard(false)}
            onComplete={(data) => {
              setAddress(data.address)
              setStartDate(data.startDate)
              setEndDate(data.endDate)
              setCountry(data.country)
              setCostBasisMethod(data.costBasisMethod)
              setNetwork(data.network)
              setShowWizard(false)
            }}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Report Configuration
                </CardTitle>
                <CardDescription>Configure your tax report parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Address Input */}
                <div className="space-y-2">
                  <Label htmlFor="address">
                    Wallet Address
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="address"
                    placeholder="0x... or T..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">Enter the wallet address to analyze</p>
                </div>

                {/* Network Selector */}
                <div className="space-y-2">
                  <Label>
                    Blockchain Network
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select value={network} onValueChange={setNetwork}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NETWORKS.map((net) => (
                        <SelectItem key={net.id} value={net.id}>
                          {net.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Picker */}
                <div className="space-y-4">
                  <Label>
                    Tax Year / Date Range
                    <span className="text-red-500 ml-1">*</span>
                  </Label>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Start Date */}
                    <div>
                      <Label className="text-xs text-muted-foreground">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "MMM dd, yyyy") : "Start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* End Date */}
                    <div>
                      <Label className="text-xs text-muted-foreground">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !endDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "MMM dd, yyyy") : "End date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* Country Selector */}
                <div className="space-y-2">
                  <Label>
                    Country/Jurisdiction
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Cost Basis Method */}
                <div className="space-y-2">
                  <Label>
                    Cost Basis Method
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Select value={costBasisMethod} onValueChange={setCostBasisMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COST_BASIS_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div>
                            <div className="font-medium">{method.label}</div>
                            <div className="text-xs text-muted-foreground">{method.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateReport}
                  disabled={!isFormValid || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isGenerating ? "Generating Report..." : "Generate Tax Report"}
                </Button>

                {/* Progress Indicator */}
                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Generating report...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                {/* Tax Terms Tooltips */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Cost Basis:</strong> The original value of an asset for tax purposes.
                    <br />
                    <strong>FIFO:</strong> First purchased tokens are sold first.
                    <br />
                    <strong>Short-term:</strong> Assets held for less than 1 year.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {/* Error State */}
            {reportError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to generate tax report: {reportError.message}</AlertDescription>
              </Alert>
            )}

            {/* Tax Report Results */}
            {taxReport && (
              <div className="space-y-6">
                {/* Export Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Tax Report Generated</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={exportToCSV}>
                          <Download className="h-4 w-4 mr-2" />
                          CSV
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportToPDF}>
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={saveReport}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" size="sm" onClick={emailReport}>
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Report for {taxReport.metadata.address} • {taxReport.metadata.period}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Tax Summary */}
                <TaxSummaryCards summary={taxReport.summary} />

                {/* Detailed Results */}
                <Tabs defaultValue="events" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="events">Taxable Events</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                  </TabsList>

                  <TabsContent value="events">
                    <TaxableEventsTable events={taxReport.taxable_events} />
                  </TabsContent>

                  <TabsContent value="summary">
                    <Card>
                      <CardHeader>
                        <CardTitle>Report Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Address:</strong> {taxReport.metadata.address}
                          </div>
                          <div>
                            <strong>Period:</strong> {taxReport.metadata.period}
                          </div>
                          <div>
                            <strong>Country:</strong> {taxReport.metadata.country}
                          </div>
                          <div>
                            <strong>Method:</strong> {taxReport.metadata.method.toUpperCase()}
                          </div>
                          <div>
                            <strong>Generated:</strong> {new Date(taxReport.metadata.generated_at).toLocaleString()}
                          </div>
                          <div>
                            <strong>Total Events:</strong> {taxReport.taxable_events.length}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Empty State */}
            {!taxReport && !isGenerating && !reportError && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Tax Report Generated</h3>
                  <p className="text-muted-foreground text-center">
                    Fill out the form on the left and click "Generate Tax Report" to create your crypto tax report
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
