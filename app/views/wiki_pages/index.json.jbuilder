json.array!(@wiki_pages) do |wiki_page|
  json.extract! wiki_page, :id, :title, :body, :version, :product_id, :story_id, :task_id, :user_id
  json.url wiki_page_url(wiki_page, format: :json)
end
