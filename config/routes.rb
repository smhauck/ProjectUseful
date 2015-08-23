ProjectUseful::Application.routes.draw do

  resources :project_status_types
  resources :departments
  resources :slas
  resources :organizations
  resources :project_assignments
  resources :meetings
  resources :projects
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

  resources :blog_posts

  resources :blogs

  controller :pages do
      get 'license' => :license
      get 'technology' => :technology
  end
  
#   resources :wiki_pages

  get 'admin' => 'admin#index'

  resources :wikis do
    resources :wiki_pages
  end

  
  get 'stories/active' => 'stories#active'
  get 'stories/complete' => 'stories#complete'

  get 'tasks/my' => 'tasks#my'
  get 'tasks/myactive' => 'tasks#myactive'
  get 'tasks/alltoday' => 'tasks#alltoday'
  get 'tasks/mytoday' => 'tasks#mytoday'
  get 'tasks/mycomplete' => 'tasks#mycomplete'
  get 'tasks/active' => 'tasks#active'
  get 'tasks/complete' => 'tasks#complete'

  
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

  controller :sessions do
    get 'login' => :new
    post 'login' => :create
    get 'logout' => :destroy
  end

  
  



  get "sessions/create"
  get "sessions/destroy"
  get "welcome/index"



  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
