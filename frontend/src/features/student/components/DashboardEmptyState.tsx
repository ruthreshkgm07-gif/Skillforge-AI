import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const DashboardEmptyState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-8 text-center shadow-none">
        <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg">
            <Sparkles className="h-8 w-8" />
          </div>

          <div className="max-w-md space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Unlock Your AI Career Blueprint
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload your resume to get instant ATS scoring, keyword gap diagnostics, and placement likelihood analysis.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link to="/student/resume">
              <Button variant="gradient" className="gap-2 shadow-md hover:shadow-primary/25">
                <FileText className="h-4 w-4" /> Upload Resume
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardEmptyState;
