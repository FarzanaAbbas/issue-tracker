import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client.js";
import IssueForm from "../components/IssueForm.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { ErrorState, Loading } from "../components/States.jsx";

export default function EditIssue() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/issues/${id}`).then((res) => setIssue(res.data.issue)).catch((err) => setError(err.message));
  }, [id]);

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
      {error ? <ErrorState message={error} /> : issue ? <IssueForm issue={issue} /> : <Loading />}
    </div>
  );
}
