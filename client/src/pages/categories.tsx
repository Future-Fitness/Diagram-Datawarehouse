import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";
import ImageGrid from "../components/ImageGrid";

const GRAPHQL_ENDPOINT = "http://localhost:4000/graphql"; // Change this to your API URL

const GET_DIAGRAMS_BY_SUBJECT_QUERY = gql`
  query GetAllDiagramsBySubjectType($subjectId: ID!, $page: Int, $limit: Int) {
    getAllDiagramsBySubjectType(subjectId: $subjectId, page: $page, limit: $limit) {
      diagrams {
        id
        title
        image_url
        created_at
      }
      total
      totalPages
      currentPage
    }
  }
`;

const fetchDiagramsBySubject = async ({ queryKey }: any) => {
  const [, subjectId, page, limit] = queryKey;
  return request(GRAPHQL_ENDPOINT, GET_DIAGRAMS_BY_SUBJECT_QUERY, { subjectId, page, limit })
    .then((data) => data.getAllDiagramsBySubjectType);
};

export default function SubjectDiagramsPage() {
  const { subjectId } = useParams<{ subjectId: string }>();

  const { data: imagesData, isLoading, error } = useQuery({
    queryKey: ["subjectDiagrams", subjectId, 1, 10],
    queryFn: fetchDiagramsBySubject,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">Diagrams for Subject</h1>
      </header>

      <ImageGrid images={imagesData?.diagrams || []} loading={isLoading} error={error?.message} />
    </div>
  );
} 