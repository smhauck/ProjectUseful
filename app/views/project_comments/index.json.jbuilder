json.array!(@project_comments) do |project_comment|
  json.extract! project_comment, :id, :user_id, :project_id, :comment
  json.url project_comment_url(project_comment, format: :json)
end
