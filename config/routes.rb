Rails.application.routes.draw do
  resource :session
  resources :passwords, param: :token

  resources :contact_emails
  resources :email_types
  resources :contacts
  resources :sexes
  resources :project_comments
  resources :project_comments
  resources :project_status_types
  resources :departments
  resources :slas
  resources :organizations
  resources :project_assignments
  resources :meetings
  get 'notes/search' => 'notes#search'

  resources :product_groups

  resources :group_users

  resources :group_members

  resources :groups

  resources :task_comment_types

  resources :task_types

  resources :story_types

  resources :issue_types

  resources :task_comments

  resources :issues

  resources :issue_status_types

  resources :meeting_assignments

  resources :note_privacy_types

  resources :story_assignments

  resources :task_assignments


  resources :blogs do
    resources :blog_posts
  end

  controller :pages do
      get 'about' => :about
      get 'changelog' => :changelog
      get 'faq' => :faq
      get 'guide' => :guide
      get 'license' => :license
      get 'privacy' => :privacy
      get 'roadmap' => :roadmap
      get 'technology' => :technology
      get 'terms' => :terms
      get 'changelog' => :changelog
  end
  
#   resources :wiki_pages

  get 'admin' => 'admin#index'

  resources :wikis do
    resources :wiki_pages
  end


  get 'projects/my' => 'projects#my'
  get 'projects/myactive' => 'projects#myactive'
  get 'projects/alltoday' => 'projects#alltoday'
  get 'projects/mytoday' => 'projects#mytoday'
  get 'projects/mycomplete' => 'projects#mycomplete'
  get 'projects/active' => 'projects#active'
  get 'projects/complete' => 'projects#complete'

  
  get 'stories/active' => 'stories#active'
  get 'stories/complete' => 'stories#complete'

  get 'tasks/my' => 'tasks#my'
  get 'tasks/myactive' => 'tasks#myactive'
  get 'tasks/alltoday' => 'tasks#alltoday'
  get 'tasks/mytoday' => 'tasks#mytoday'
  get 'tasks/mycomplete' => 'tasks#mycomplete'
  get 'tasks/active' => 'tasks#active'
  get 'tasks/complete' => 'tasks#complete'
  get 'tasks/search' => 'tasks#search'

  
  resources :notes
  resources :product_status_types
  resources :products
  resources :project_status_types
  resources :projects
  resources :sprint_status_types
  resources :story_status_types
  resources :sprints
  resources :task_status_types

  resources :stories

  resources :tasks
  
  resources :users


  get "login" => "sessions#new"


  get "pages/index"

  get "up" => "rails/health#show", as: :rails_health_check


  root 'pages#index'
end
