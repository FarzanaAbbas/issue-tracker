import { useParams } from "react-router-dom";
import IssueForm from "../components/IssueForm.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { FormSkeleton } from "../components/Skeletons.jsx";
import { ErrorState } from "../components/States.jsx";
import { useApi } from "../hooks/useApi.js";

export default function EditIssue() {
  const { id } = useParams();
  const { data, error } = useApi(`/issues/${id}`);
  const issue = data?.issue;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Edit issue"
        breadcrumbs={[
          { label: "Issues", to: "/issues" },
          { label: issue?.title ?? "Issue", to: `/issues/${id}` },
          { label: "Edit" },
        ]}
      />
      {error && !issue ? (
        <ErrorState message={error} />
      ) : issue ? (
        // key: remount the form with fresh values if the cached issue gets refreshed
        <IssueForm key={issue.updatedAt} issue={issue} />
      ) : (
        <FormSkeleton />
      )}
    </div>
  );
}
