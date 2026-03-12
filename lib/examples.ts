export type ToolExample =
    | string
    | { left: string; right: string }
    | { json: string; schema: string };

export const EXAMPLES: Record<string, ToolExample> = {
    "json-formatter": `{"server":{"host":"127.0.0.1","port":8080,"proxy":null,"active":true,"routes":[{"path":"/api/v1","methods":["GET","POST"]},{"path":"/health","methods":["GET"]}]}}`,

    "json-validator": `{
  "userId": "usr_9823749823",
  "status": "PRO_MEMBER",
  "limits": {
    "requestsPerMinute": 1000,
    "concurrency": 50
  },
  "features": ["audit_logs", "custom_domains"]
}`,

    "json-minifier": `{
  "database": {
    "type": "postgres",
    "host": "db.internal.network",
    "port": 5432,
    "credentials": {
      "username": "api_worker",
      "password": "redacted"
    }
  }
}`,

    "json-to-csv": `[
  {
    "id": 1,
    "name": "Acme Corp",
    "status": "active",
    "revenue": 5000000,
    "tags": ["enterprise", "b2b"]
  },
  {
    "id": 2,
    "name": "Globex",
    "status": "pending",
    "revenue": null,
    "tags": ["startup"]
  },
  {
    "id": 3,
    "name": "Initech",
    "status": "inactive",
    "revenue": 100000,
    "tags": []
  }
]`,

    "json-diff": {
        left: `{
  "environment": "production",
  "debug": false,
  "cacheDuration": 3600,
  "endpoints": {
    "auth": "https://auth.api.example.com",
    "data": "https://data.api.example.com"
  }
}`,
        right: `{
  "environment": "staging",
  "debug": true,
  "cacheDuration": 60,
  "endpoints": {
    "auth": "https://auth-staging.api.example.com",
    "data": "https://data.api.example.com",
    "metrics": "https://metrics.api.example.com"
  }
}`
    },

    "json-path-tester": `{
  "store": {
    "book": [
      {
        "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      {
        "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      },
      {
        "category": "fiction",
        "author": "Herman Melville",
        "title": "Moby Dick",
        "isbn": "0-553-21311-3",
        "price": 8.99
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  }
}`,

    "json-schema-validator": {
        json: `{
  "productId": 10243,
  "productName": "Ergonomic Keyboard",
  "price": 129.99,
  "tags": ["office", "accessories"]
}`,
        schema: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Product",
  "type": "object",
  "properties": {
    "productId": {
      "type": "integer"
    },
    "productName": {
      "type": "string",
      "minLength": 3
    },
    "price": {
      "type": "number",
      "exclusiveMinimum": 0
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "minItems": 1
    }
  },
  "required": [
    "productId",
    "productName",
    "price"
  ]
}`
    }
};
