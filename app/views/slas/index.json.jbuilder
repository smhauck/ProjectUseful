json.array!(@slas) do |sla|
  json.extract! sla, :id, :name, :description, :product_id, :response_due_at, :workaround_due_at, :solution_due_at
  json.url sla_url(sla, format: :json)
end
