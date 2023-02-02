import { Review } from "@prisma/client";
import { Card, CardHeader, CardBody, CardFooter, Text } from "@chakra-ui/react";

const PostPreview = ({ post }: { post: Review }) => {
  return (
    <Card>
      <CardBody>
        <Text>View a summary of all your customers over the last month.</Text>
      </CardBody>
    </Card>
  );
};
export default PostPreview;
