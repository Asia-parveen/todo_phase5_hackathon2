# Data Model: Filter and Sort Tasks

## Task Entity

**Description**: Represents a user's task item with properties including status, priority, tags, due date, creation date, and title

**Fields**:
- `id` (str): Unique identifier for the task
- `title` (str): Task title or description
- `status` (str): Current status ('pending', 'completed')
- `priority` (str): Priority level ('low', 'medium', 'high', 'critical')
- `tags` (List[str]): List of tags associated with the task
- `due_date` (datetime, optional): Date when the task is due
- `created_date` (datetime): Date when the task was created
- `updated_date` (datetime): Last updated timestamp

**Validation Rules**:
- `title` must be non-empty
- `status` must be one of ['pending', 'completed']
- `priority` must be one of ['low', 'medium', 'high', 'critical']
- `due_date` must be in the future if provided
- `tags` must be valid alphanumeric strings

## Filter Criteria

**Description**: Parameters that specify which tasks to include in results (status, priority, tags, due date presence)

**Fields**:
- `status` (str, optional): Filter by task status ('pending', 'completed')
- `priority` (str, optional): Filter by priority level ('low', 'medium', 'high', 'critical')
- `tags` (List[str], optional): Filter by one or more tags (matches any tag)
- `has_due_date` (bool, optional): Filter by due date presence (true = has due date, false = no due date)

**Validation Rules**:
- `status` must be one of ['pending', 'completed'] if provided
- `priority` must be one of ['low', 'medium', 'high', 'critical'] if provided
- `tags` must be non-empty strings
- `has_due_date` must be boolean if provided

## Sort Criteria

**Description**: Parameters that specify the order of returned tasks (creation date, due date, priority, title with ascending/descending options)

**Fields**:
- `sort_by` (str): Field to sort by ('created_date', 'due_date', 'priority', 'title')
- `order` (str): Sort order ('asc', 'desc')

**Validation Rules**:
- `sort_by` must be one of ['created_date', 'due_date', 'priority', 'title']
- `order` must be one of ['asc', 'desc']
- If `sort_by` is 'due_date', tasks without due dates are sorted last regardless of order

## State Transitions

**From Pending to Completed**: When a task is marked as complete
**From Completed to Pending**: When a completed task is reopened

## Relationships

Tasks have no direct relationships with other entities but are logically grouped by tags, priority, and status.