import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Zuper API Documentation',
      version: '1.0.0',
      description: `
        Zuper is a full-stack vehicle rental and subscription platform that simplifies car, bike, 
        and scooter leasing through flexible plans. This API enables customers to book vehicles, 
        providers to manage their fleet, and admins to oversee the entire platform.
        
        ## Features
        - Multi-role authentication (Customer, Provider, Admin)
        - Vehicle management with Azure Blob Storage
        - Booking and contract management
        - Payment processing with Razorpay
        - Document verification system
        - Real-time messaging
      `,
      contact: {
        name: 'Zuper Support',
        email: 'support@zuper.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://zuper-backend.onrender.com/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login endpoints'
        }
      },
      schemas: {
        Customer: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            phone: { type: 'string', example: '+919876543210' },
            isEmailVerified: { type: 'boolean', example: true },
            isPhoneVerified: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Provider: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
            name: { type: 'string', example: 'Jane Smith' },
            email: { type: 'string', format: 'email', example: 'jane@example.com' },
            phone: { type: 'string', example: '+919876543211' },
            businessName: { type: 'string', example: 'Smith Rentals' },
            isEmailVerified: { type: 'boolean', example: true },
            vehicles: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Vehicle: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439013' },
            company: { type: 'string', example: 'Toyota' },
            model: { type: 'string', example: 'Camry' },
            year: { type: 'integer', example: 2023 },
            licensePlate: { type: 'string', example: 'KA01AB1234' },
            dailyRate: { type: 'number', example: 2500.00 },
            location: { type: 'string', example: 'Bangalore' },
            type: { type: 'string', enum: ['car', 'bike', 'scooter'], example: 'car' },
            status: { type: 'string', enum: ['available', 'rented', 'maintenance'], example: 'available' },
            features: { type: 'array', items: { type: 'string' }, example: ['AC', 'GPS', 'Bluetooth'] },
            images: { type: 'array', items: { type: 'string' } },
            provider: { type: 'string', example: '507f1f77bcf86cd799439012' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'An error occurred' },
            error: { type: 'string', example: 'Error details' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Operation successful' }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Not authorized' }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Resource not found' }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration endpoints'
      },
      {
        name: 'Customers',
        description: 'Customer management endpoints'
      },
      {
        name: 'Providers',
        description: 'Provider management endpoints'
      },
      {
        name: 'Vehicles',
        description: 'Vehicle CRUD operations'
      },
      {
        name: 'Bookings',
        description: 'Booking and contract management'
      },
      {
        name: 'Payments',
        description: 'Payment processing with Razorpay'
      },
      {
        name: 'Documents',
        description: 'Document verification system'
      },
      {
        name: 'Messages',
        description: 'Messaging between customers and providers'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'] // Path to API docs
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
