import { Request, Response } from 'express';
import { logger } from '../utils/logger';

// Define the context type for GraphQL resolvers
export interface GraphQLContext {
  req: Request;
  res: Response;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Create context for each GraphQL request
export const createContext = async ({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<GraphQLContext> => {
  // Here you can add authentication logic
  // For example, verify JWT token and get user data
  
  // Example of getting user from token
  // const token = req.headers.authorization?.split(' ')[1];
  // const user = token ? verifyToken(token) : null;
  
  return {
    req,
    res,
    // user,
  };
};

// Example token verification function
// const verifyToken = (token: string) => {
//   try {
//     // Verify and decode token
//     // const decoded = jwt.verify(token, process.env.JWT_SECRET!);
//     // return decoded;
//     return null;
//   } catch (error) {
//     logger.error('Token verification failed', { error });
//     return null;
//   }
// };
