import IssueForm from "../components/IssueForm.jsx";
import PageHeader from "../components/PageHeader.jsx";

export default function NewIssue() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Create a new issue"
        description="Describe the problem clearly so the assignee can act on it."
        breadcrumbs={[{ label: "Issues", to: "/issues" }, { label: "New issue" }]}
      />
      <IssueForm />
    </div>
  );
}
