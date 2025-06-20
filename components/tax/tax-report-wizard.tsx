"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CalendarIcon, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TaxReportWizardProps {
  onClose: () => void
  onComplete: (data: {
    address: string
    startDate: Date
    endDate: Date
    country: string
    costBasisMethod: string
    network: string
  }) => void
}

const WIZARD_STEPS = [
  { id: 1, title: "Welcome", description: "Get started with crypto tax reporting" },
  { id: 2, title: "Wallet Setup", description: "Connect your wallet or enter address" },
  { id: 3, title: "Tax Settings", description: "Configure your tax preferences" },
  { id: 4, title: "Review", description: "Review and generate report" },
]

const COUNTRIES = [
  { value: "US", label: "United States", description: "FIFO required, short/long-term distinction" },
  { value: "CA", label: "Canada", description: "Average cost method preferred" },
  { value: "UK", label: "United Kingdom", description: "Same day rule applies" },
  { value: "AU", label: "Australia", description: "CGT discount for long-term holdings" },
]

const COST_BASIS_METHODS = [
  { value: "fifo", label: "FIFO (First In, First Out)", description: "Most common, required in US" },
  { value: "lifo", label: "LIFO (Last In, First Out)", description: "May reduce short-term gains" },
  { value: "average_cost", label: "Average Cost", description: "Simplified calculation" },
]

export function TaxReportWizard({ onClose, onComplete }: TaxReportWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    address: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    country: "",
    costBasisMethod: "fifo",
    network: "ethereum",
  })

  const progress = (currentStep / WIZARD_STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    if (formData.address && formData.startDate && formData.endDate && formData.country) {
      onComplete(formData as any)
    }
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return true
      case 2:
        return !!formData.address
      case 3:
        return !!formData.country && !!formData.startDate && !!formData.endDate
      case 4:
        return true
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Welcome to Crypto Tax Reporting</h3>
              <p className="text-muted-foreground mb-6">
                This wizard will guide you through generating a comprehensive tax report for your crypto transactions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What We'll Calculate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Capital gains and losses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Income from airdrops & staking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Transaction fees & costs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Short vs long-term classification</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What You'll Need</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-600" />
                    <span className="text-sm">Wallet address or connection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-600" />
                    <span className="text-sm">Tax year date range</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-600" />
                    <span className="text-sm">Country/jurisdiction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-600" />
                    <span className="text-sm">Cost basis method preference</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Wallet Setup</h3>
              <p className="text-muted-foreground">
                Enter your wallet address or connect your wallet to analyze transactions.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="wizard-address">Wallet Address</Label>
                <Input
                  id="wizard-address"
                  placeholder="0x... or T..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the wallet address you want to generate a tax report for
                </p>
              </div>

              <div>
                <Label>Blockchain Network</Label>
                <Select
                  value={formData.network}
                  onValueChange={(value) => setFormData({ ...formData, network: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="bsc">BSC</SelectItem>
                    <SelectItem value="tron">Tron</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-blue-50 dark:bg-blue-950">
                <CardContent className="pt-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Privacy Note:</strong> Your wallet address is only used to fetch transaction data. We don't
                    store your private keys or have access to your funds.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Tax Settings</h3>
              <p className="text-muted-foreground">Configure your tax preferences and reporting period.</p>
            </div>

            <div className="space-y-6">
              {/* Date Range */}
              <div>
                <Label className="text-base font-semibold">Tax Year / Reporting Period</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label className="text-sm text-muted-foreground">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.startDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.startDate ? format(formData.startDate, "MMM dd, yyyy") : "Start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) => setFormData({ ...formData, startDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.endDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.endDate ? format(formData.endDate, "MMM dd, yyyy") : "End date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.endDate}
                          onSelect={(date) => setFormData({ ...formData, endDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Country */}
              <div>
                <Label className="text-base font-semibold">Country/Jurisdiction</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        <div>
                          <div className="font-medium">{country.label}</div>
                          <div className="text-xs text-muted-foreground">{country.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cost Basis Method */}
              <div>
                <Label className="text-base font-semibold">Cost Basis Method</Label>
                <Select
                  value={formData.costBasisMethod}
                  onValueChange={(value) => setFormData({ ...formData, costBasisMethod: value })}
                >
                  <SelectTrigger className="mt-2">
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
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Review & Generate</h3>
              <p className="text-muted-foreground">Review your settings and generate your crypto tax report.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Wallet Address</Label>
                    <p className="font-mono text-sm">{formData.address}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Network</Label>
                    <p className="capitalize">{formData.network}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Period</Label>
                    <p>
                      {formData.startDate && formData.endDate
                        ? `${format(formData.startDate, "MMM dd, yyyy")} - ${format(formData.endDate, "MMM dd, yyyy")}`
                        : "Not set"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Country</Label>
                    <p>{COUNTRIES.find((c) => c.value === formData.country)?.label || "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Cost Basis Method</Label>
                    <p>{COST_BASIS_METHODS.find((m) => m.value === formData.costBasisMethod)?.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-950">
              <CardContent className="pt-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Ready to Generate:</strong> Your tax report will include capital gains/losses, income events,
                  and detailed transaction analysis based on your settings.
                </p>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crypto Tax Report Wizard</DialogTitle>
          <DialogDescription>
            Step {currentStep} of {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep - 1]?.description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between">
          {WIZARD_STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep >= step.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600",
                )}
              >
                {step.id}
              </div>
              <span className="text-xs mt-1 text-center">{step.title}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">{renderStep()}</div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < WIZARD_STEPS.length ? (
            <Button onClick={handleNext} disabled={!isStepValid(currentStep)}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={!isStepValid(currentStep)}>
              Generate Report
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
